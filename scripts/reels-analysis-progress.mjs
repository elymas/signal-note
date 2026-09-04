import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reelsSources } from '../src/data/reels-sources.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inventoryPath = path.join(
  rootDir,
  'research/reels-inventory/facebook-login-2026-09-04.json',
);
const checkpointPath = path.join(rootDir, 'research/reels-analysis/checkpoint.json');

const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const checkpoint = fs.existsSync(checkpointPath)
  ? JSON.parse(fs.readFileSync(checkpointPath, 'utf8'))
  : { deferred: [] };
const deferredIds = new Set(checkpoint.deferred.map(({ id }) => id));

const getResearchState = async (slug) => {
  const source = reelsSources.find((candidate) => candidate.slug === slug);
  if (!source) throw new Error(`출처 레지스트리에 없는 slug: ${slug}`);
  const research = await source.load();
  const matchedIds = research.reels.map(({ id }) => String(id));
  return {
    analyzedIds: new Set(matchedIds),
    declaredCount: Number(research.reelCount),
    duplicateCount: matchedIds.length - new Set(matchedIds).size,
  };
};

const rows = await Promise.all(inventory.sources.map(async (source) => {
  const { analyzedIds, declaredCount, duplicateCount } = await getResearchState(source.slug);
  const inventoryIds = new Set(source.reelIds);
  const analyzed = [...analyzedIds].filter((id) => inventoryIds.has(id));
  const missingFromInventory = [...analyzedIds].filter((id) => !inventoryIds.has(id));
  const deferred = source.reelIds.filter((id) => deferredIds.has(id));
  const pending = source.reelIds.filter(
    (id) => !analyzedIds.has(id) && !deferredIds.has(id),
  );

  return {
    slug: source.slug,
    inventory: source.reelIds.length,
    analyzed: analyzed.length,
    declared: declaredCount,
    deferred: deferred.length,
    pending: pending.length,
    duplicates: duplicateCount,
    missingFromInventory: missingFromInventory.length,
    declaredMatches: declaredCount === analyzedIds.size,
    nextId: pending[0] ?? null,
  };
}));

const totals = rows.reduce(
  (result, row) => ({
    inventory: result.inventory + row.inventory,
    analyzed: result.analyzed + row.analyzed,
    deferred: result.deferred + row.deferred,
    pending: result.pending + row.pending,
    missingFromInventory: result.missingFromInventory + row.missingFromInventory,
    duplicates: result.duplicates + row.duplicates,
  }),
  {
    inventory: 0,
    analyzed: 0,
    deferred: 0,
    pending: 0,
    missingFromInventory: 0,
    duplicates: 0,
  },
);

console.table(rows);
console.log(JSON.stringify({
  inventoryEnumeratedAt: inventory.enumeratedAt ?? null,
  checkpointUpdatedAt: checkpoint.updatedAt ?? null,
  totals,
}, null, 2));

if (
  totals.inventory !== totals.analyzed + totals.deferred + totals.pending ||
  totals.missingFromInventory !== 0 ||
  totals.duplicates !== 0 ||
  rows.some(({ declaredMatches }) => !declaredMatches)
) {
  process.exitCode = 1;
}
