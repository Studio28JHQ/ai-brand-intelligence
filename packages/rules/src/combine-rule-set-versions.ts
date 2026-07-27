// Combines multiple RuleSetVersion.version strings (each already a sorted, '+'-joined list of
// `ruleId@ruleVersion` entries, per RuleRegistry.getRuleSetVersion) into one, using the exact
// same sort+join convention — so a caller that evaluates rules across more than one Registry
// invocation (e.g. a Core scope and an AI-Visibility scope) can still expose one combined
// ruleSetVersion for the whole audit.
export function combineRuleSetVersions(versions: ReadonlyArray<string>): string {
  const entries = versions.flatMap((version) => (version.length > 0 ? version.split('+') : []));
  return Array.from(new Set(entries)).sort().join('+');
}
