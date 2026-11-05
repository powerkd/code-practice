import { Runner } from "./Runner.js";

const workerSource = `
  const logs = [];
  console.log = (...a) => logs.push(
    a.map(x => typeof x === "object" ? JSON.stringify(x) : String(x)).join(" ")
  );
  onmessage = e => {
    try {
      const { code, tests, fn } = e.data;
      const f = new Function(code + "\\n; return typeof " + fn + " === 'function' ? " + fn + " : null;")();
      if (!tests) { postMessage({ logs, error: null }); return; }
      if (!f) { postMessage({ logs, error: "找不到函式 " + fn }); return; }
      const results = tests.map(({args, expected}) => {
        try {
          const actual = f(...args);
          return { args, expected, actual, pass: JSON.stringify(actual) === JSON.stringify(expected) };
        } catch (err) {
          return { args, expected, actual: String(err), pass: false };
        }
      });
      postMessage({ logs, error: null, results });
    } catch (err) {
      postMessage({ logs, error: String(err) });
    }
  };
`;

export class JsRunner extends Runner {
  constructor() {
    super("javascript", "JavaScript");
  }

  _execute(payload, timeout = 3000) {
    return new Promise((resolve) => {
      const worker = new Worker(URL.createObjectURL(new Blob([workerSource])));
      const timer = setTimeout(() => {
        worker.terminate();
        resolve({ logs: [], error: "執行超過 3 秒,可能有無窮迴圈。" });
      }, timeout);
      const done = (data) => {
        clearTimeout(timer);
        worker.terminate();
        resolve(data);
      };
      worker.onmessage = (e) => done(e.data);
      worker.onerror = (e) => done({ logs: [], error: e.message });
      worker.postMessage(payload);
    });
  }

  async run(code) {
    return this._execute({ code, tests: null, fn: "" });
  }

  async judge(code, tests, lang) {
    return this._execute({ code, tests, fn: lang.fn });
  }
}
