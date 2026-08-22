import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inventoryPath = path.join(
  rootDir,
  'research/reels-inventory/facebook-login-2026-08-21.json',
);
const checkpointPath = path.join(rootDir, 'research/reels-analysis/checkpoint.json');

const sourceFiles = {
  'ahmed-on-chart': 'src/data/reels-pages/ahmed-on-chart.js',
  'travis-woo': 'src/data/reels-pages/travis-woo.js',
  'tarzan-trading-tt': 'src/data/reels-pages/tarzan-trading-tt.js',
  'erick-jablonski': 'src/data/reels-pages/erick-jablonski.js',
  luxalgo: 'src/data/reels-pages/luxalgo.js',
  'trader-note-jason': 'src/data/reels-pages/trader-note-jason.js',
  'dumb-hunter': 'src/data/reels-pages/dumb-hunter.js',
  'coin-announcer': 'src/data/reels-pages/coin-announcer.js',
  'max-anthony': 'src/data/reels-research-data.js',
  'omar-agag': 'src/data/reels-pages/omar-agag.js',
  yostrades: 'src/data/reels-pages/yostrades.js',
};

const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const checkpoint = fs.existsSync(checkpointPath)
  ? JSON.parse(fs.readFileSync(checkpointPath, 'utf8'))
  : { deferred: [] };
const deferredIds = new Set(checkpoint.deferred.map(({ id }) => id));

const getResearchState = (relativePath) => {
  const source = fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
  const matchedIds = [...source.matchAll(/\bid:\s*['"](\d+)['"]/g)].map(
    (match) => match[1],
  );

  return {
    analyzedIds: new Set(matchedIds),
    declaredCount: Number(source.match(/\breelCount:\s*(\d+)/)?.[1]),
    duplicateCount: matchedIds.length - new Set(matchedIds).size,
  };
};

const rows = inventory.sources.map((source) => {
  const { analyzedIds, declaredCount, duplicateCount } = getResearchState(
    sourceFiles[source.slug],
  );
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
});

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
console.log(JSON.stringify({ updatedAt: checkpoint.updatedAt ?? null, totals }, null, 2));

if (
  totals.inventory !== totals.analyzed + totals.deferred + totals.pending ||
  totals.missingFromInventory !== 0 ||
  totals.duplicates !== 0 ||
  rows.some(({ declaredMatches }) => !declaredMatches)
) {
  process.exitCode = 1;
}
