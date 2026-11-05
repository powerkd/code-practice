import { problems } from "../problems/problems.js";
import { getRunner, listRunners } from "../runners/index.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const show = (v) => JSON.stringify(v);
const HINT = '<span class="dim">按「執行」看輸出,按「提交」檢查答案。</span>';

export function mountApp(root) {
  root.innerHTML = `
    <header>
      <h1>💻 程式練習平台</h1>
      <select id="select-problem"></select>
      <select id="select-lang"></select>
      <button class="run" id="btn-run">▶ 執行</button>
      <button class="submit" id="btn-submit">✔ 提交</button>
      <button class="reset" id="btn-reset">重置</button>
    </header>
    <main>
      <div id="problem"></div>
      <div id="right">
        <textarea id="editor" spellcheck="false"></textarea>
        <div id="output">${HINT}</div>
      </div>
    </main>`;

  const $ = (id) => root.querySelector("#" + id);
  const selProblem = $("select-problem"), selLang = $("select-lang");
  const editor = $("editor"), out = $("output");

  let curProblem = 0;
  let curLang = "javascript";

  const storageKey = () => `code_${problems[curProblem].id}_${curLang}`;

  listRunners().forEach((r) => selLang.add(new Option(r.name, r.id)));
  problems.forEach((p, i) => selProblem.add(new Option(p.title, i)));

  selProblem.onchange = () => { curProblem = +selProblem.value; load(); };
  selLang.onchange = () => { curLang = selLang.value; load(); };

  function load() {
    const p = problems[curProblem];
    const lang = p.languages[curLang];
    $("problem").innerHTML = `<h2>${p.title}</h2>${p.desc}`;
    if (!lang) {
      editor.value = "";
      editor.disabled = true;
      out.innerHTML = '<span class="bad">這題目前沒有此語言的版本。</span>';
      return;
    }
    editor.disabled = false;
    editor.value = localStorage.getItem(storageKey()) || lang.starter;
    out.innerHTML = HINT;
  }

  editor.addEventListener("input", () => localStorage.setItem(storageKey(), editor.value));
  editor.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      editor.setRangeText("  ", editor.selectionStart, editor.selectionEnd, "end");
      editor.dispatchEvent(new Event("input"));
    }
  });

  $("btn-reset").onclick = () => { localStorage.removeItem(storageKey()); load(); };

  $("btn-run").onclick = async () => {
    out.innerHTML = '<span class="dim">執行中…</span>';
    const runner = getRunner(curLang);
    if (!runner.ready) await runner.init();
    const r = await runner.run(editor.value);
    let html = "";
    if (r.logs?.length) html += esc(r.logs.join("\n")) + "\n";
    if (r.error) html += `<span class="bad">錯誤:${esc(r.error)}</span>`;
    else if (!r.logs?.length) html += '<span class="dim">(沒有輸出,可以用 console.log() 印出內容)</span>';
    out.innerHTML = html;
  };

  $("btn-submit").onclick = async () => {
    out.innerHTML = '<span class="dim">評測中…</span>';
    const p = problems[curProblem];
    const runner = getRunner(curLang);
    if (!runner.ready) await runner.init();
    const r = await runner.judge(editor.value, p.tests, p.languages[curLang]);
    if (r.error) { out.innerHTML = `<span class="bad">錯誤:${esc(r.error)}</span>`; return; }
    let passed = 0, html = "";
    r.results.forEach((t, i) => {
      if (t.pass) passed++;
      const call = `${p.languages[curLang].fn}(${t.args.map(show).join(", ")})`;
      html += t.pass
        ? `<span class="ok">✔ 測資 ${i + 1} 通過</span>  ${esc(call)}\n`
        : `<span class="bad">✘ 測資 ${i + 1} 失敗</span>  ${esc(call)}\n    預期:${esc(show(t.expected))}\n    實際:${esc(show(t.actual))}\n`;
    });
    const all = passed === r.results.length;
    html = `<b class="${all ? "ok" : "bad"}">${all ? "🎉 全部通過!" : "未全部通過"} (${passed}/${r.results.length})</b>\n\n` + html;
    out.innerHTML = html;
  };

  load();
}
