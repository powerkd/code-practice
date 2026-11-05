import { JsRunner } from "./JsRunner.js";
import { PythonRunner } from "./PythonRunner.js";

const runners = {
  javascript: new JsRunner(),
  python: new PythonRunner(),
};

export function getRunner(id) {
  return runners[id];
}

export function listRunners() {
  return Object.values(runners);
}
