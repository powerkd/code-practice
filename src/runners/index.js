import { JsRunner } from "./JsRunner.js";

const runners = {
  javascript: new JsRunner(),
  // Step 6 會加入 python
};

export function getRunner(id) {
  return runners[id];
}

export function listRunners() {
  return Object.values(runners);
}
