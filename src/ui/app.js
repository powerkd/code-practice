import { problems, groupByTopic, stars } from "../problems/index.js";
import { getRunner, listRunners } from "../runners/index.js";
import { createEditor } from './editor.js';
import { translateError } from "../utils/errorTranslator.js";
import { markSolved, isSolved, countSolved } from '../utils/progress.js';
import { showVisualizer } from "./visualizer.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const show = (v) => JSON.stringify(v);
const HINT = '<span class="dim">👋 寫好程式後,按「▶ 執行」看輸出,或按「✔ 提交」檢查答案。</span>';

function formatError(lang, message) {
  const { zh, raw } = translateError(lang, message);
  if (!zh) return `<span class="bad">錯誤:${esc(raw)}</span>`;
  return `<span class="bad">❌ ${esc(zh)}</span>\n<span class="dim">原文:${esc(raw)}</span>`;
}

export function mountApp(root) {
  root.innerHTML = `
    <header>
      <h1>🧩 程式練習平台</h1>
      <div class="selects">
        <select id="select-problem"></select>
        <select id="select-lang"></select>
      </div>
      <div class="actions">
        <button class="run" id="btn-run">▶ 執行</button>
        <button class="submit" id="btn-submit">✔ 提交</button>
        <button class="ghost" id="btn-viz">👁 視覺化</button>
        <button class="ghost" id="btn-reset">重置</button>
        <button class="ghost" id="btn-next">下一題 ➜</button>
      </div>
      <div class="progress"><div class="bar"><div id="bar-fill"></div></div><span id="bar-text"></span></div>
    </header>
    <main>
      <div id="problem"></div>
      <div id="right">
        <div id="editor" spellcheck="false"></div>
        <div class="out-wrap">
          <div class="out-title">輸出結果</div>
          <div id="output">${HINT}</div>
        </div>
      </div>
    </main>`;

  const $ = (id) => root.querySelector("#" + id);
  const selProblem = $("select-problem"), selLang = $("select-lang");
  const out = $("output");

  let curProblem = 0;
  let curLang = "javascript";

  const storageKey = () => `code_${problems[curProblem].id}_${curLang}`;
  const editor = createEditor($("editor"), {
    onChange: (text) => localStorage.setItem(storageKey(), text),
  });

  listRunners().forEach((r) => selLang.add(new Option(r.name, r.id)));

function renderProblemList() {
   selProblem.innerHTML = "";
   groupByTopic().forEach((g) => {
     const group = document.createElement("optgroup");
     group.label = g.name;
     g.items.forEach((p) => {
       const mark = isSolved(p.id, curLang) ? "✅ " : "";
       group.appendChild(new Option(`${mark}${p.title}  ${stars(p.difficulty)}`, problems.indexOf(p)));
     });
     selProblem.appendChild(group);
   });
   selProblem.value = curProblem;
 
   const done = countSolved(problems, curLang);
   $("bar-fill").style.width = (done / problems.length) * 100 + "%";
   $("bar-text").textContent = `${done} / ${problems.length}`;
 }


function load() {
  const p = problems[curProblem];
  const lang = p.languages[curLang];
  $("problem").innerHTML = `
    <div class="p-head">
      <h2>${p.title}</h2>
      <span class="badge">難度 ${stars(p.difficulty)}</span>
    </div>
    <div class="p-body">${p.desc}</div>`;
  if (!lang) {
    editor.setValue("");
    editor.setReadOnly(true);
    out.innerHTML = '<span class="bad">這題目前沒有此語言的版本。</span>';
    return;
  }
  editor.setReadOnly(false);
  editor.setLanguage(curLang);
  editor.setValue(localStorage.getItem(storageKey()) || lang.starter);
  out.innerHTML = HINT;
}

  selLang.onchange = () => {
    curLang = selLang.value;
    renderProblemList();
    load();
  };

  selProblem.onchange = () => {
    curProblem = Number(selProblem.value);
    load();
  };


  $("btn-reset").onclick = () => { localStorage.removeItem(storageKey()); load(); };
  $("btn-next").onclick = () => {
  curProblem = (curProblem + 1) % problems.length;
  selProblem.value = curProblem;
  renderProblemList();
  load();
};

  $("btn-run").onclick = async () => {
    out.innerHTML = '<span class="dim">執行中…</span>';
    const runner = getRunner(curLang);
    if (!runner.ready) {
      out.innerHTML = '<span class="dim">首次載入 ' + runner.name + ' 執行環境,請稍候(約 10 秒)…</span>';
      await runner.init();
    }
    const r = await runner.run(editor.getValue());
    let html = "";
    if (r.logs?.length) html += esc(r.logs.join("\n")) + "\n";
    if (r.error) html += formatError(curLang, r.error);
    else if (!r.logs?.length) {
      const fnName = curLang === "python" ? "print()" : "console.log()";
      html += `<span class="dim">(沒有輸出,可以用 ${fnName} 印出內容)</span>`;
    }
    out.innerHTML = html;
  };

  $("btn-submit").onclick = async () => {
    out.innerHTML = '<span class="dim">評測中…</span>';
    const p = problems[curProblem];
    const runner = getRunner(curLang);
    if (!runner.ready) {
        out.innerHTML = '<span class="dim">首次載入 ' + runner.name + '執行環境,請稍後(約 10 秒)...</span>';
        await runner.init();
    }
    const r = await runner.judge(editor.getValue(), p.tests, p.languages[curLang]);
    if (r.error) { out.innerHTML = formatError(curLang, r.error); return; }
    let passed = 0, html = "";
    r.results.forEach((t, i) => {
      if (t.pass) passed++;
      const call = `${p.languages[curLang].fn}(${t.args.map(show).join(", ")})`;
      html += t.pass
        ? `<span class="ok">✔ 測資 ${i + 1} 通過</span>  ${esc(call)}\n`
        : `<span class="bad">✘ 測資 ${i + 1} 失敗</span>  ${esc(call)}\n    預期:${esc(show(t.expected))}\n    實際:${esc(show(t.actual))}\n`;
    });
    const all = passed === r.results.length;
    if (all) {
        markSolved(p.id,curLang);
        renderProblemList();
    }
    html = `<b class="${all ? "ok" : "bad"}">${all ? "🎉 全部通過!" : "未全部通過"} (${passed}/${r.results.length})</b>\n\n` + html;
    out.innerHTML = html;
  };

    $("btn-viz").onclick = async () => {
    if (curLang !== "python") {
      out.innerHTML = '<span class="dim">視覺化目前只支援 Python,請先切換語言。</span>';
      return;
    }
    const p = problems[curProblem];
    const runner = getRunner(curLang);
    if (!runner.ready) {
      out.innerHTML = '<span class="dim">首次載入 Python 執行環境,請稍候(約 10 秒)…</span>';
      await runner.init();
    }
    out.innerHTML = '<span class="dim">記錄執行過程中…</span>';
    const code = editor.getValue();
    const r = await runner.trace(code, p.languages.python.fn, p.tests[0].args);
    if (!r.steps?.length) {
      out.innerHTML = r.error ? formatError(curLang, r.error) : '<span class="dim">沒有可顯示的執行步驟。</span>';
      return;
    }
    showVisualizer(out, code, r.steps, r.truncated, r.error);
  };

  renderProblemList();
  load();
}
