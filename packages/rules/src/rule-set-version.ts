export interface RuleVersionEntry {
  ruleId: string;
  ruleVersion: string;
}

export interface RuleSetVersion {
  version: string;
  rules: RuleVersionEntry[];
}
