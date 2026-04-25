import { resolvePath } from "../utils/resolvePath";

export function validateLabCompletion(lab: any, session: any) {
  const successConditions = lab.successConditions;

  if (!successConditions || !successConditions.rules) {
    return {
      completed: false,
      matchedRules: 0,
      totalRules: 0
    };
  }

  let matchedRules = 0;

  for (const rule of successConditions.rules) {
    if (rule.type === "fieldEquals") {
      const device = session.state.devices[rule.deviceId];

      if (!device) {
        continue;
      }

      const actualValue = resolvePath(device, rule.path);

      if (actualValue === rule.value) {
        matchedRules++;
      }
    }
  }

  const totalRules = successConditions.rules.length;

  const completed =
    successConditions.mode === "all"
      ? matchedRules === totalRules
      : matchedRules > 0;

  return {
    completed,
    matchedRules,
    totalRules
  };
}