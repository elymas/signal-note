import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { dumbHunterResearch } from '../src/data/reels-pages/dumb-hunter.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactRoot = path.join(rootDir, 'artifacts');
const sourceSlug = 'dumb-hunter';
const concurrency = Number(process.argv.find((arg) => arg.startsWith('--concurrency='))?.split('=')[1] ?? 6);

const runCommand = (command, args) => new Promise((resolve) => {
  const child = spawn(command, args, {
    cwd: rootDir,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout = `${stdout}${chunk}`.slice(-8_000); });
  child.stderr.on('data', (chunk) => { stderr = `${stderr}${chunk}`.slice(-8_000); });
  child.on('error', (error) => resolve({ code: -1, stdout, stderr: `${stderr}\n${error.message}` }));
  child.on('close', (code) => resolve({ code, stdout, stderr }));
});

const runPool = async (items, worker) => {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }));
  return results;
};

const filesById = new Map();
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(filePath);
      continue;
    }
    const match = entry.name.match(/^(\d+)\.(?:info\.json|txt|transcript\.txt|caption\.txt|mp4|visual\.[^.]+|sheet\.(?:jpg|png)|jpg)$/);
    if (!match || path.basename(path.dirname(filePath)) !== sourceSlug) continue;
    const paths = filesById.get(match[1]) ?? [];
    paths.push(filePath);
    filesById.set(match[1], paths);
  }
};
walk(artifactRoot);

const recoveredIds = dumbHunterResearch.recoveredReels.map(({ id }) => String(id));
const records = recoveredIds.map((id) => {
  const paths = filesById.get(id) ?? [];
  const infoPaths = paths.filter((filePath) => filePath.endsWith('.info.json'));
  if (!infoPaths.length) throw new Error(`Missing metadata for ${id}`);
  const score = (infoPath) => {
    const directory = path.dirname(infoPath);
    return [
      `${id}.txt`,
      `${id}.transcript.txt`,
      `${id}.caption.txt`,
    ].reduce((total, name) => total + (fs.existsSync(path.join(directory, name)) ? 1 : 0), 0);
  };
  const infoPath = infoPaths.sort((left, right) => score(right) - score(left))[0];
  const sheetPath = paths.find((filePath) => /\.sheet\.(?:jpg|png)$/.test(filePath)) ?? null;
  const visualPath = paths.find((filePath) => /\.visual\.[^.]+$/.test(filePath) && !filePath.endsWith('.visual.txt'))
    ?? paths.find((filePath) => path.basename(filePath) === `${id}.mp4`)
    ?? null;
  return { id, infoPath, directory: path.dirname(infoPath), sheetPath, visualPath };
});

const pending = records.filter(({ sheetPath }) => !sheetPath);
console.log(JSON.stringify({ recovered: records.length, existingSheets: records.length - pending.length, pending: pending.length, concurrency }));

const results = await runPool(pending, async (record, index) => {
  let visualPath = record.visualPath;
  let downloadError = null;
  if (!visualPath) {
    const formatAttempts = [
      'worstvideo[ext=mp4]/worstvideo',
      'sd',
      'best[height<=480]/best',
    ];
    for (const format of formatAttempts) {
      const result = await runCommand('yt-dlp', [
        '--retries', '3',
        '--fragment-retries', '3',
        '--no-warnings',
        '-f', format,
        '-o', path.join(record.directory, '%(id)s.visual.%(ext)s'),
        `https://www.facebook.com/reel/${record.id}/`,
      ]);
      visualPath = fs.readdirSync(record.directory)
        .map((name) => path.join(record.directory, name))
        .find((filePath) => path.basename(filePath).startsWith(`${record.id}.visual.`)
          && !filePath.endsWith('.visual.txt')) ?? null;
      if (result.code === 0 && visualPath) break;
      downloadError = result.stderr.trim().split(/\r?\n/).at(-1) ?? `yt-dlp exit ${result.code}`;
    }
  }

  if (!visualPath) return { id: record.id, status: 'download-failed', error: downloadError };
  const info = JSON.parse(fs.readFileSync(record.infoPath, 'utf8'));
  const sampleRate = Math.max(20 / Math.max(Number(info.duration) || 200, 20), 1 / 90);
  const sheetPath = path.join(record.directory, `${record.id}.sheet.jpg`);
  const result = await runCommand('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', visualPath,
    '-vf', `fps=${sampleRate},scale=270:-1,tile=5x4:padding=4:margin=4`,
    '-frames:v', '1',
    sheetPath,
  ]);
  const status = result.code === 0 && fs.existsSync(sheetPath) ? 'review-ready' : 'sheet-failed';
  if ((index + 1) % 25 === 0 || index + 1 === pending.length) {
    console.log(`visuals ${index + 1}/${pending.length}`);
  }
  return {
    id: record.id,
    status,
    visualPath,
    sheetPath: status === 'review-ready' ? sheetPath : null,
    error: status === 'review-ready' ? null : result.stderr.trim().split(/\r?\n/).at(-1),
  };
});

const manifest = {
  completedAt: new Date().toISOString(),
  source: sourceSlug,
  recoveredCount: records.length,
  existingSheetCount: records.length - pending.length,
  attemptedCount: pending.length,
  summary: results.reduce((summary, result) => {
    summary[result.status] = (summary[result.status] ?? 0) + 1;
    return summary;
  }, {}),
  records: results,
};
const manifestPath = path.join(artifactRoot, 'dumb-hunter-backlog-visual-recovery-2026-09-04.json');
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ manifestPath, summary: manifest.summary }, null, 2));
if (results.some(({ status }) => status !== 'review-ready')) process.exitCode = 1;
