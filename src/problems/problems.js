export const problems = [
  {
    id: "basic-001",
    title: "1. 兩數相加",
    desc: "<p>請完成函式,回傳 a 與 b 的總和。</p><pre>add(1, 2) → 3</pre>",
    languages: {
      javascript: {
        fn: "add",
        starter: "function add(a, b) {\n  // 在這裡寫你的程式\n  \n}\n",
      },
    },
    tests: [
      { args: [1, 2], expected: 3 },
      { args: [-5, 5], expected: 0 },
      { args: [100, 250], expected: 350 },
      { args: [0, 0], expected: 0 },
    ],
  },
  {
    id: "basic-002",
    title: "2. 判斷偶數",
    desc: "<p>完成函式,偶數回傳 <code>true</code>,否則 <code>false</code>。</p>",
    languages: {
      javascript: { fn: "isEven", starter: "function isEven(n) {\n  \n}\n" },
    },
    tests: [
      { args: [2], expected: true },
      { args: [7], expected: false },
      { args: [0], expected: true },
      { args: [-3], expected: false },
    ],
  },
  {
    id: "string-001",
    title: "3. 反轉字串",
    desc: "<p>完成函式,回傳反轉後的字串。</p><pre>reverse(\"abc\") → \"cba\"</pre>",
    languages: {
      javascript: { fn: "reverse", starter: "function reverse(s) {\n  \n}\n" },
    },
    tests: [
      { args: ["abc"], expected: "cba" },
      { args: [""], expected: "" },
      { args: ["hello"], expected: "olleh" },
    ],
  },
  {
    id: "array-001",
    title: "4. 陣列最大值",
    desc: "<p>完成函式,回傳陣列中的最大值。</p>",
    languages: {
      javascript: { fn: "maxOf", starter: "function maxOf(arr) {\n  \n}\n" },
    },
    tests: [
      { args: [[1, 5, 3]], expected: 5 },
      { args: [[-2, -9, -1]], expected: -1 },
      { args: [[7]], expected: 7 },
    ],
  },
];
