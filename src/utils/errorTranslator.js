// 每條規則: [正規表達式, 中文說明(可用 $1 $2 取代擷取內容)]
const rules = {
  javascript: [
    [/(\w+) is not defined/, "找不到變數或函式「$1」。是不是拼錯了,或忘了先宣告?"],
    [/(\w+) is not a function/, "「$1」不是函式,卻被當成函式呼叫。檢查名稱或型別。"],
    [/Cannot read propert(?:y|ies) of (undefined|null)/, "你正在讀取一個「$1」值的屬性。先確認這個變數真的有值。"],
    [/Unexpected token/, "語法錯誤:有多餘或缺少的符號。檢查括號、引號與逗號是否成對。"],
    [/Unexpected end of input/, "語法錯誤:程式碼提前結束,可能少了 } 或 )。"],
    [/Invalid or unexpected token/, "語法錯誤:出現無法辨識的符號,檢查是否用了全形字元或沒關閉的引號。"],
    [/Assignment to constant variable/, "你想修改一個用 const 宣告的常數。改用 let 吧。"],
    [/Identifier '(\w+)' has already been declared/, "變數「$1」重複宣告了。"],
    [/Maximum call stack size exceeded/, "遞迴太深:函式一直呼叫自己卻沒有停下來。檢查終止條件。"],
    [/找不到函式 (\w+)/, "找不到函式「$1」。函式名稱必須和題目要求完全一樣。"],
    [/執行超過/, "程式跑太久,可能有無窮迴圈。檢查迴圈的結束條件。"],
  ],
  python: [
    [/NameError: name '(\w+)' is not defined/, "找不到變數或函式「$1」。檢查拼字,或是否先定義過。"],
    [/SyntaxError: invalid syntax/, "語法錯誤:檢查冒號 :、括號與引號是否漏寫或不成對。"],
    [/SyntaxError: expected ':'/, "語法錯誤:if、for、def 等行的結尾少了冒號 :。"],
    [/IndentationError: expected an indented block/, "縮排錯誤:冒號後面的下一行需要縮排(通常 4 個空格)。"],
    [/IndentationError/, "縮排錯誤:同一層的程式碼縮排必須一致。"],
    [/TypeError: unsupported operand type\(s\) for (.+): '(\w+)' and '(\w+)'/, "型別錯誤:不能對 $2 和 $3 做「$1」運算。"],
    [/TypeError: can only concatenate str/, "型別錯誤:字串不能直接和數字相加,請用 str() 轉換。"],
    [/TypeError: '(\w+)' object is not callable/, "型別錯誤:$1 不是函式,卻被當成函式呼叫。"],
    [/TypeError: (\w+)\(\) takes (\d+) positional arguments? but (\d+) (?:was|were) given/, "參數數量錯誤:函式 $1 需要 $2 個參數,但你給了 $3 個。"],
    [/ZeroDivisionError/, "除以零:分母不能是 0。"],
    [/IndexError: list index out of range/, "索引超出範圍:你存取了不存在的位置。注意索引從 0 開始。"],
    [/KeyError: (.+)/, "字典裡沒有鍵 $1。"],
    [/ValueError: invalid literal for int\(\)/, "無法把這段文字轉成整數,檢查內容是否為純數字。"],
    [/RecursionError/, "遞迴太深:函式一直呼叫自己卻沒有停下來。檢查終止條件。"],
    [/找不到函式 (\w+)/, "找不到函式「$1」。函式名稱必須和題目要求完全一樣。"],
    [/執行超過/, "程式跑太久,可能有無窮迴圈。檢查迴圈的結束條件。"],
  ],
};

// 回傳 { zh: 中文說明或 null, raw: 原文 }
export function translateError(lang, message) {
  const raw = String(message);
  for (const [pattern, template] of rules[lang] || []) {
    const m = raw.match(pattern);
    if (m) {
      const zh = template.replace(/\$(\d)/g, (_, i) => m[i] ?? "");
      return { zh, raw };
    }
  }
  return { zh: null, raw };
}
