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
`;

onmessage = async (e) => {
  const { type, code, fn, tests } = e.data;
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
    } else {
      raw = g.get("_judge")(code, fn, JSON.stringify(tests));
    }
    const data = JSON.parse(raw);
    postMessage({
      type: "done",
      logs: data.out ? data.out.replace(/\n$/, "").split("\n") : [],
      error: data.error,
      results: data.results,
    });
  } catch (err) {
    postMessage({ type: "done", logs: [], error: String(err) });
  }
};
