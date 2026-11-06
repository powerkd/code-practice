const KEY = "progress";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function markSolved(problemId, lang) {
  const data = load();
  data[`${problemId}:${lang}`] = true;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function isSolved(problemId, lang) {
  return !!load()[`${problemId}:${lang}`];
}

// 回傳某語言已完成的題數
export function countSolved(problems, lang) {
  return problems.filter((p) => isSolved(p.id, lang)).length;
}

export function clearProgress() {
  localStorage.removeItem(KEY);
}
