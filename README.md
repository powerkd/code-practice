# 程式練習平台

繁體中文友善的線上程式練習平台,支援 **JavaScript** 與 **Python**,並提供 **Python 逐步視覺化執行**。純前端,免註冊,可安裝為 PWA。

🔗 **線上體驗:** https://你的帳號.github.io/code-practice/

![截圖](docs/screenshot.png)

## 特色

- 🇹🇼 **繁體中文友善**:介面與題目皆為繁體中文,常見錯誤訊息翻譯成白話提示並保留英文原文
- 📚 **主題題庫**:基礎入門、資料結構、演算法思維,附難度星等
- 👁 **視覺化執行**:逐行顯示程式執行位置與變數變化,支援播放、上一步、下一步
- ✅ **進度紀錄**:自動記錄各語言通過的題目
- 📱 **響應式與 PWA**:手機、電腦皆可使用,可安裝

## 技術架構

| 項目 | 技術 |
|---|---|
| 建置 | Vite |
| 編輯器 | Monaco Editor |
| JS 執行 | Web Worker(含逾時中斷) |
| Python 執行 | Pyodide(WebAssembly,於 Worker 內執行) | 
| 視覺化 | Python `sys.settrace` 記錄快照 |
| 儲存 | localStorage |
| 部署 | GitHub Pages + GitHub Actions |

### Runner 架構

所有語言實作同一個 `Runner` 介面(`init` / `run` / `judge`),新增語言只需新增一個 Runner 與題目的 `languages` 欄位。

```
src/
├─ runners/     各語言執行器
├─ problems/    JSON 題庫與主題
├─ ui/          介面、編輯器、視覺化
└─ utils/       錯誤翻譯、進度紀錄
```

## 本機執行

```bash
npm install
npm run dev
```

## Roadmap

- [ ] 更多題目與主題
- [ ] 更多語言(透過 Runner 擴充)
- [ ] JavaScript 視覺化
- [ ] 題目提示功能
