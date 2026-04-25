export type ValidationMode = "all" | "any";

export interface SuccessConditionsDefinition {
  mode: ValidationMode;
  rules: ValidationRule[];
}

export type ValidationRule = FieldEqualsRule;

export interface FieldEqualsRule {
  type: "fieldEquals";
  deviceId: string;
  path: string;
  value: string;
}

export interface ValidationResult {
  completed: boolean;
  matchedRules: number;
  totalRules: number;
}