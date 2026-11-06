import { Runner } from "./Runner.js";

export class PythonRunner extends Runner {
  constructor() {
    super("python", "Python");
    this.worker = null;
    this.initPromise = null;
  }

  _createWorker() {
    this.worker = new Worker(import.meta.env.BASE_URL + "pyodide.worker.js");
    this.initPromise = new Promise((resolve, reject) => {
      this.worker.onmessage = (e) => {
        if (e.data.type === "ready") { this.ready = true; resolve(); }
      };
      this.worker.onerror = (e) => reject(new Error(e.message));
      this.worker.postMessage({ type: "init" });
    });
  }

  async init() {
    if (!this.worker) this._createWorker();
    await this.initPromise;
  }

  _call(payload, timeout = 5000) {
    return new Promise((resolve) => {
      const worker = this.worker;
      const timer = setTimeout(() => {
        worker.terminate();
        this.worker = null;
        this.ready = false;
        resolve({ logs: [], error: "執行超過 5 秒,可能有無窮迴圈。" });
      }, timeout);
      worker.onmessage = (e) => {
        if (e.data.type !== "done") return;
        clearTimeout(timer);
        resolve(e.data);
      };
      worker.onerror = (e) => {
        clearTimeout(timer);
        resolve({ logs: [], error: e.message });
      };
      worker.postMessage(payload);
    });
  }

  async run(code) {
    await this.init();
    return this._call({ type: "run", code });
  }

  async judge(code, tests, lang) {
    await this.init();
    return this._call({ type: "judge", code, fn: lang.fn, tests });
  }

  async trace(code, fn, args) {
    await this.init();
    return this._call({ type: "trace", code, fn, args });
  }
}
