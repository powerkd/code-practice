const workerSource = `
  const logs = [];
  console.log = (...a) => logs.push(
    a.map(x => typeof x === "object" ? JSON.stringify(x) : String(x)).join(" ")
  );
  onmessage = e => {
    try {
      const { code, tests, fn } = e.data;
      const f = new Function(code + "\\n; return typeof " + fn + " === 'function' ? " + fn + " : null;")();
      if (tests.length === 0) { postMessage({ logs }); return; }
      if (!f) { postMessage({ logs, error: "找不到函式 " + fn }); return; }
      const results = tests.map(([args, expected]) => {
        try {
          const actual = f(...args);
          return { args, expected, actual, pass: JSON.stringify(actual) === JSON.stringify(expected) };
        } catch (err) {
          return { args, expected, actual: String(err), pass: false };
        }
      });
      postMessage({ logs, results });
    } catch (err) {
      postMessage({ logs, error: String(err) });
    }
  };
`;

export function execute(code, tests, fn, timeout = 3000) {
  return new Promise((resolve) => {
    const worker = new Worker(URL.createObjectURL(new Blob([workerSource])));
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({ error: "執行超過 3 秒,可能有無窮迴圈。" });
    }, timeout);
    const done = (data) => { clearTimeout(timer); worker.terminate(); resolve(data); };
    worker.onmessage = (e) => done(e.data);
    worker.onerror = (e) => done({ error: e.message });
    worker.postMessage({ code, tests, fn });
  });
}
