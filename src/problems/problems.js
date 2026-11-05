export const problems = [
  {
    title: "1. 兩數相加",
    desc: "<p>請完成函式 <code>add(a, b)</code>,回傳 a 與 b 的總和。</p><pre>add(1, 2) → 3</pre>",
    fn: "add",
    starter: "function add(a, b) {\n  // 在這裡寫你的程式\n  \n}\n",
    tests: [[[1, 2], 3], [[-5, 5], 0], [[100, 250], 350], [[0, 0], 0]],
  },
  {
    title: "2. 判斷偶數",
    desc: "<p>完成 <code>isEven(n)</code>,偶數回傳 <code>true</code>,否則 <code>false</code>。</p>",
    fn: "isEven",
    starter: "function isEven(n) {\n  \n}\n",
    tests: [[[2], true], [[7], false], [[0], true], [[-3], false]],
  },
  {
    title: "3. 反轉字串",
    desc: "<p>完成 <code>reverse(s)</code>,回傳反轉後的字串。</p><pre>reverse(\"abc\") → \"cba\"</pre>",
    fn: "reverse",
    starter: "function reverse(s) {\n  \n}\n",
    tests: [[["abc"], "cba"], [[""], ""], [["hello"], "olleh"]],
  },
  {
    title: "4. 陣列最大值",
    desc: "<p>完成 <code>maxOf(arr)</code>,回傳陣列中的最大值。</p>",
    fn: "maxOf",
    starter: "function maxOf(arr) {\n  \n}\n",
    tests: [[[[1, 5, 3]], 5], [[[-2, -9, -1]], -1], [[[7]], 7]],
  },
];
