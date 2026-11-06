const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

let pyodide = null;

async function init() {
  importScripts(PYODIDE_URL + "pyodide.js");
  pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
}

// 把 JS 值轉成 Python 可用的資料(用 JSON 避免型別問題)
const RUNNER_PY = `
import sys, io, json, traceback

def _run(code):
    buf = io.StringIO()
    old = sys.stdout
    sys.stdout = buf
    err = None
    try:
        exec(code, {"__name__": "__main__"})
    except Exception:
        err = traceback.format_exc(limit=0).strip().splitlines()[-1]
    finally:
        sys.stdout = old
    return json.dumps({"out": buf.getvalue(), "error": err})

def _judge(code, fn, tests_json):
    tests = json.loads(tests_json)
    buf = io.StringIO()
    old = sys.stdout
    sys.stdout = buf
    ns = {"__name__": "__main__"}
    try:
        exec(code, ns)
    except Exception:
        sys.stdout = old
        err = traceback.format_exc(limit=0).strip().splitlines()[-1]
        return json.dumps({"out": buf.getvalue(), "error": err})
    f = ns.get(fn)
    if not callable(f):
        sys.stdout = old
        return json.dumps({"out": buf.getvalue(), "error": "找不到函式 " + fn})
    results = []
    for t in tests:
        try:
            actual = f(*t["args"])
            ok = json.dumps(actual) == json.dumps(t["expected"])
        except Exception as e:
            actual = type(e).__name__ + ": " + str(e)
            ok = False
        results.append({"args": t["args"], "expected": t["expected"], "actual": actual, "pass": ok})
    sys.stdout = old
    return json.dumps({"out": buf.getvalue(), "error": None, "results": results})
    
def _safe(v):
    r = repr(v)
    return r if len(r) <= 60 else r[:57] + "..."

class _Stop(BaseException):
    pass

def _trace(code, fn, args_json):
    steps = []
    buf = io.StringIO()
    old = sys.stdout
    MAX = 300

    def snap(frame):
        d = {}
        for k, v in frame.f_locals.items():
            if k.startswith("__"):
                continue
            if callable(v) or type(v).__name__ == "module":
                continue
            d[k] = _safe(v)
        return d

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != "<user>":
            return None
        if event == "line":
            if len(steps) >= MAX:
                raise _Stop()
            steps.append({
                "line": frame.f_lineno,
                "func": frame.f_code.co_name,
                "vars": snap(frame),
                "out": buf.getvalue(),
            })
        return tracer

    err = None
    truncated = False
    ns = {"__name__": "__main__"}
    sys.stdout = buf
    sys.settrace(tracer)
    try:
        exec(compile(code, "<user>", "exec"), ns)
        f = ns.get(fn)
        if fn and callable(f):
            f(*json.loads(args_json))
    except _Stop:
        truncated = True
    except Exception:
        err = traceback.format_exc(limit=0).strip().splitlines()[-1]
    finally:
        sys.settrace(None)
        sys.stdout = old
    return json.dumps({"steps": steps, "error": err, "truncated": truncated, "out": buf.getvalue()})
`;

onmessage = async (e) => {
  const { type, code, fn, tests, args } = e.data;
  try {
    if (type === "init") {
      await init();
      pyodide.runPython(RUNNER_PY);
      postMessage({ type: "ready" });
      return;
    }
    const g = pyodide.globals;
    let raw;
    if (type === "run") {
      raw = g.get("_run")(code);
    } else if (type === "trace") {
      raw = g.get("_trace")(code, fn || "", JSON.stringify(args || []));
    } else {
      raw = g.get("_judge")(code, fn, JSON.stringify(tests));
    }
    const data = JSON.parse(raw);
    postMessage({
      type: "done",
      logs: data.out ? data.out.replace(/\n$/, "").split("\n") : [],
      error: data.error,
      results: data.results,
      steps: data.steps,
      truncated: data.truncated,
    });
  } catch (err) {
    postMessage({ type: "done", logs: [], error: String(err) });
  }
};
