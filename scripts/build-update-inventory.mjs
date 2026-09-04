import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baselinePath = path.join(rootDir, 'research/reels-inventory/facebook-login-2026-08-21.json');
const auditPath = path.join(rootDir, 'research/video-inventory/update-audit-2026-09-04.json');
const outputPath = path.join(rootDir, 'research/reels-inventory/facebook-login-2026-09-04.json');
const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
const changed = new Map(audit.facebook.map((source) => [source.slug, source]));
const unchanged = new Map(audit.facebookUnchanged.map((source) => [source.slug, source]));
const deferred = new Map(audit.facebookDeferred.map((source) => [source.slug, source]));

const sources = baseline.sources.map((source) => {
  const update = changed.get(source.slug);
  const stable = unchanged.get(source.slug);
  const blocked = deferred.get(source.slug);
  const reelIds = update
    ? [...new Set([...update.newIds, ...source.reelIds])]
    : [...new Set(source.reelIds)];
  const currentPublicCount = update?.currentPublicCount ?? stable?.currentPublicCount ?? null;
  if (update && currentPublicCount !== source.reelIds.length + update.newIds.length - update.missingIds.length) {
    throw new Error(`Public count reconciliation failed: ${source.slug}`);
  }
  if (update && reelIds.length !== source.reelIds.length + update.newIds.length) {
    throw new Error(`Union inventory contains duplicates: ${source.slug}`);
  }
  return {
    ...source,
    previousCount: source.reelIds.length,
    priorInventoryCount: source.reelIds.length,
    authenticatedCount: currentPublicCount,
    historicalUnionCount: reelIds.length,
    addedSincePriorInventory: update?.newIds.length ?? 0,
    unavailableAtAudit: update?.missingIds ?? [],
    auditDeferredReason: blocked?.reason ?? null,
    consecutiveStableChecks: update?.consecutiveStableChecks ?? source.consecutiveStableChecks ?? null,
    reelIds,
  };
});

const result = {
  ...baseline,
  enumeratedAt: audit.auditedAt,
  methodology: `${audit.method}. reelIds is a historical union so previously analyzed items that are currently unavailable remain auditable.`,
  sources,
};
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);

const total = sources.reduce((sum, source) => sum + source.reelIds.length, 0);
const added = sources.reduce((sum, source) => sum + source.addedSincePriorInventory, 0);
console.log(JSON.stringify({ outputPath, sources: sources.length, total, added }, null, 2));
