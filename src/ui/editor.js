import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker();
  },
};

monaco.editor.defineTheme("practice-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: { "editor.background": "#11111b" },
});

export function createEditor(container, { onChange } = {}) {
  const editor = monaco.editor.create(container, {
    value: "",
    language: "javascript",
    theme: "practice-dark",
    fontSize: 15,
    fontFamily: "Consolas, monospace",
    minimap: { enabled: false },
    automaticLayout: true,   // 視窗大小改變時自動調整
    tabSize: 2,
    scrollBeyondLastLine: false,
  });

  let silent = false; // setValue 時不要觸發 onChange

  editor.onDidChangeModelContent(() => {
    if (!silent && onChange) onChange(editor.getValue());
  });

  return {
    getValue: () => editor.getValue(),
    setValue(text) {
      silent = true;
      editor.setValue(text);
      silent = false;
    },
    setLanguage(lang) {
      monaco.editor.setModelLanguage(editor.getModel(), lang);
    },
    setReadOnly(flag) {
      editor.updateOptions({ readOnly: flag });
    },
  };
}
