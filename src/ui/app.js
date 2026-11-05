import { problems } from "../problems/problems.js";
import { execute } from "../utils/executor.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const show = (v) => JSON.stringify(v);
const HINT = '<span class="dim">按「執行」看輸出,按「提交」檢查答案。</span>';

export function mountApp(root) {
  root.innerHTML = `
    <header>
      <h1>💻 JavaScript 程式練習</h1>
      <select id="select"></select>
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
  const sel = $("select"), editor = $("editor"), out = $("output");
  let cur = 0;

  problems.forEach((p, i) => sel.add(new Option(p.title, i)));
  sel.onchange = () => load(+sel.value);

  function load(i) {
    cur = i;
    const p = problems[i];
    $("problem").innerHTML = `<h2>${p.title}</h2>${p.desc}`;
    editor.value = localStorage.getItem("code_" + i) || p.starter;
    out.innerHTML = HINT;
  }

  editor.addEventListener("input", () => localStorage.setItem("code_" + cur, editor.value));
  editor.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      editor.setRangeText("  ", editor.selectionStart, editor.selectionEnd, "end");
      editor.dispatchEvent(new Event("input"));
    }
  });

  $("btn-reset").onclick = () => { localStorage.removeItem("code_" + cur); load(cur); };

  $("btn-run").onclick = async () => {
    out.innerHTML = '<span class="dim">執行中…</span>';
    const r = await execute(editor.value, [], problems[cur].fn);
    let html = "";
    if (r.logs?.length) html += esc(r.logs.join("\n")) + "\n";
    if (r.error) html += `<span class="bad">錯誤:${esc(r.error)}</span>`;
    else if (!r.logs?.length) html += '<span class="dim">(沒有輸出,可以用 console.log() 印出內容)</span>';
    out.innerHTML = html;
  };

  $("btn-submit").onclick = async () => {
    out.innerHTML = '<span class="dim">評測中…</span>';
    const p = problems[cur];
    const r = await execute(editor.value, p.tests, p.fn);
    if (r.error) { out.innerHTML = `<span class="bad">錯誤:${esc(r.error)}</span>`; return; }
    let passed = 0, html = "";
    r.results.forEach((t, i) => {
      if (t.pass) passed++;
      const call = `${p.fn}(${t.args.map(show).join(", ")})`;
      html += t.pass
        ? `<span class="ok">✔ 測資 ${i + 1} 通過</span>  ${esc(call)}\n`
        : `<span class="bad">✘ 測資 ${i + 1} 失敗</span>  ${esc(call)}\n    預期:${esc(show(t.expected))}\n    實際:${esc(show(t.actual))}\n`;
    });
    const all = passed === r.results.length;
    html = `<b class="${all ? "ok" : "bad"}">${all ? "🎉 全部通過!" : "未全部通過"} (${passed}/${r.results.length})</b>\n\n` + html;
    out.innerHTML = html;
  };

  load(0);
}
