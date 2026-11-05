import { topics } from "./topics.js";

// 一次載入 data 資料夾裡所有 JSON
const modules = import.meta.glob("./data/*.json", { eager: true });

export const problems = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.id.localeCompare(b.id));

export { topics };

// 依主題分組,給下拉選單使用
export function groupByTopic() {
  return topics
    .map((t) => ({ ...t, items: problems.filter((p) => p.topic === t.id) }))
    .filter((g) => g.items.length > 0);
}

export const stars = (n) => "★".repeat(n) + "☆".repeat(3 - n);
