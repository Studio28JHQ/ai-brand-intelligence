-- Replace `optimization_actions.title` (persisted, baked English text) with the stable
-- `optimization_rule_id`/`optimization_rule_version` reference the presentation layer resolves
-- into localized text via the `rules` i18n domain — see
-- docs/04_PROJECT/DECISION_LOG.md#cto-111.

-- AlterTable
ALTER TABLE "optimization_actions" ADD COLUMN "optimization_rule_id" TEXT;
ALTER TABLE "optimization_actions" ADD COLUMN "optimization_rule_version" TEXT;

-- Backfill from the real Finding each existing Action's first supporting Finding id already
-- references (Finding.id is `<auditId>:<ruleId>`) — never fabricated, and fails loudly (the
-- subsequent NOT NULL constraint) rather than silently if a row can't be resolved this way.
UPDATE "optimization_actions" oa
SET "optimization_rule_id" = f."rule_id",
    "optimization_rule_version" = f."rule_version"
FROM "findings" f
WHERE f."id" = (oa."supporting_finding_ids"->>0)
  AND oa."optimization_rule_id" IS NULL;

-- AlterTable
ALTER TABLE "optimization_actions" ALTER COLUMN "optimization_rule_id" SET NOT NULL;
ALTER TABLE "optimization_actions" ALTER COLUMN "optimization_rule_version" SET NOT NULL;
ALTER TABLE "optimization_actions" DROP COLUMN "title";
