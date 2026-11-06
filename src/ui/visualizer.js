const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

let timer = null;

export function showVisualizer(container, code, steps, truncated, error) {
  clearInterval(timer);

  if (!steps.length) {
    container.innerHTML = '<span class="dim">沒有可顯示的執行步驟。</span>';
    return;
  }

  const lines = code.split("\n");
  let i = 0;

  container.innerHTML = `
    <div class="viz">
      <div class="viz-ctrl">
        <button id="v-prev">◀ 上一步</button>
        <button id="v-play">▶ 播放</button>
        <button id="v-next">下一步 ▶</button>
        <input type="range" id="v-range" min="0" max="${steps.length - 1}" value="0">
        <span id="v-info"></span>
      </div>
      <div class="viz-body">
        <div id="v-code"></div>
        <div id="v-vars"></div>
      </div>
      <div class="viz-out"><b>輸出</b><pre id="v-out"></pre></div>
      <div id="v-note"></div>
    </div>`;

  const q = (id) => container.querySelector("#" + id);

  function render() {
    const s = steps[i];
    const prev = i > 0 ? steps[i - 1].vars : {};

    q("v-code").innerHTML = lines
      .map((text, idx) => {
        const n = idx + 1;
        return `<div class="vl ${n === s.line ? "on" : ""}"><span class="ln">${n}</span>${esc(text) || " "}</div>`;
      })
      .join("");

    const names = Object.keys(s.vars);
    q("v-vars").innerHTML =
      `<b>變數(在 ${esc(s.func)} 中)</b>` +
      (names.length
        ? "<table>" +
          names
            .map((k) => {
              const changed = prev[k] !== s.vars[k] ? "changed" : "";
              return `<tr class="${changed}"><td>${esc(k)}</td><td>${esc(s.vars[k])}</td></tr>`;
            })
            .join("") +
          "</table>"
        : '<div class="dim">(目前沒有變數)</div>');

    q("v-out").textContent = s.out || "(尚無輸出)";
    q("v-info").textContent = `第 ${i + 1} / ${steps.length} 步`;
    q("v-range").value = i;

    const active = q("v-code").querySelector(".on");
    if (active) active.scrollIntoView({ block: "nearest" });

    const last = i === steps.length - 1;
    q("v-note").innerHTML = last
      ? (truncated ? '<span class="bad">已達 300 步上限,後面的步驟被截斷(可能有無窮迴圈)。</span>' : "") +
        (error ? `<span class="bad">程式在這裡發生錯誤:${esc(error)}</span>` : "")
      : "";
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    q("v-play").textContent = "▶ 播放";
  }

  q("v-prev").onclick = () => { stop(); if (i > 0) i--; render(); };
  q("v-next").onclick = () => { stop(); if (i < steps.length - 1) i++; render(); };
  q("v-range").oninput = (e) => { stop(); i = Number(e.target.value); render(); };
  q("v-play").onclick = () => {
    if (timer) return stop();
    if (i >= steps.length - 1) i = 0;
    q("v-play").textContent = "⏸ 暫停";
    timer = setInterval(() => {
      if (i >= steps.length - 1) return stop();
      i++;
      render();
    }, 600);
  };

  render();
}
