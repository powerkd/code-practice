export class Runner {
  constructor(id, name) {
    this.id = id;       // 例如 "javascript"
    this.name = name;   // 顯示名稱,例如 "JavaScript"
    this.ready = false;
  }

  // 載入執行環境(JS 不需要,Python 需要下載 Pyodide)
  async init() {
    this.ready = true;
  }

  // 只執行,回傳 { logs, error }
  async run(code) {
    throw new Error("run() 尚未實作");
  }

  // 跑測資,回傳 { logs, error, results }
  // lang 是題目中該語言的設定,包含 fn、starter
  async judge(code, tests, lang) {
    throw new Error("judge() 尚未實作");
  }

  // 是否支援視覺化(Step 9 會用到)
  get supportsTrace() {
    return false;
  }
}
