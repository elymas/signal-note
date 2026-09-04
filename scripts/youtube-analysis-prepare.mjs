import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2).reduce((result, argument) => {
  const [name, value] = argument.split('=', 2);
  if (name === '--audit') result.audit = path.resolve(value);
  if (name === '--output') result.output = path.resolve(value);
  if (name === '--concurrency') result.concurrency = Number(value);
  return result;
}, { audit: null, output: null, concurrency: 3 });

if (!args.audit || !args.output) throw new Error('--audit and --output are required');
if (!Number.isInteger(args.concurrency) || args.concurrency < 1) throw new Error('--concurrency must be positive');
fs.mkdirSync(args.output, { recursive: true });

const audit = JSON.parse(fs.readFileSync(args.audit, 'utf8'));
const selection = audit.youtube.flatMap((channel) => channel.newIds.map((id) => ({
  slug: channel.slug,
  id,
  url: `https://www.youtube.com/watch?v=${id}`,
})));

const runCommand = (command, commandArgs) => new Promise((resolve) => {
  const child = spawn(command, commandArgs, {
    cwd: rootDir,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout = `${stdout}${chunk}`.slice(-20_000); });
  child.stderr.on('data', (chunk) => { stderr = `${stderr}${chunk}`.slice(-20_000); });
  child.on('error', (error) => resolve({ code: -1, stdout, stderr: `${stderr}\n${error.message}`.trim() }));
  child.on('close', (code) => resolve({ code, stdout, stderr }));
});

const runPool = async (items, concurrency, worker) => {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index]);
    }
  }));
  return results;
};

const findFile = (directory, predicate) => fs.existsSync(directory)
  ? fs.readdirSync(directory).map((name) => path.join(directory, name)).find((file) => predicate(path.basename(file))) ?? null
  : null;

const subtitleText = (subtitlePath) => {
  const data = JSON.parse(fs.readFileSync(subtitlePath, 'utf8'));
  const pieces = [];
  for (const event of data.events ?? []) {
    const value = (event.segs ?? []).map((segment) => segment.utf8 ?? '').join('').replaceAll('\n', ' ').trim();
    if (!value || value === '[Music]' || value === '[음악]') continue;
    if (pieces.at(-1) !== value) pieces.push(value);
  }
  return pieces.join(' ').replace(/\s+/g, ' ').trim();
};

const records = await runPool(selection, args.concurrency, async (item) => {
  const directory = path.join(args.output, item.slug, item.id);
  fs.mkdirSync(directory, { recursive: true });
  const template = path.join(directory, '%(id)s.%(ext)s');
  const result = await runCommand('yt-dlp', [
    '--skip-download', '--write-info-json', '--write-thumbnail',
    '--convert-thumbnails', 'jpg', '--no-warnings', '-o', template, item.url,
  ]);
  const infoPath = findFile(directory, (name) => name === `${item.id}.info.json`);
  if (result.code !== 0 || !infoPath) return { ...item, status: 'metadata-failed', error: result.stderr.trim().split(/\r?\n/).at(-1) };
  const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
  return {
    ...item,
    directory,
    infoPath,
    status: 'metadata-ready',
    title: info.title ?? null,
    description: info.description ?? null,
    uploadDate: info.upload_date ?? null,
    duration: info.duration ?? null,
  };
});

await runPool(records, args.concurrency, async (record) => {
  if (record.status !== 'metadata-ready') return;
  const template = path.join(record.directory, '%(id)s.%(ext)s');
  await runCommand('yt-dlp', [
    '--skip-download', '--write-auto-subs', '--write-subs', '--sub-langs', 'ko.*,en.*',
    '--sub-format', 'json3', '--no-warnings', '-o', template, record.url,
  ]);
  const subtitlePaths = fs.readdirSync(record.directory)
    .filter((name) => name.startsWith(`${record.id}.`) && name.endsWith('.json3'))
    .sort((left, right) => {
      const leftScore = /\.ko(?:[-_.]|$)/i.test(left) ? 0 : /\.en(?:[-_.]|$)/i.test(left) ? 1 : 2;
      const rightScore = /\.ko(?:[-_.]|$)/i.test(right) ? 0 : /\.en(?:[-_.]|$)/i.test(right) ? 1 : 2;
      return leftScore - rightScore || left.localeCompare(right);
    });
  const subtitlePath = subtitlePaths.length ? path.join(record.directory, subtitlePaths[0]) : null;
  if (subtitlePath) {
    const transcript = subtitleText(subtitlePath);
    if (transcript) fs.writeFileSync(path.join(record.directory, `${record.id}.transcript.txt`), `${transcript}\n`);
  }

  let transcriptPath = findFile(record.directory, (name) => name === `${record.id}.transcript.txt`);
  let wordCount = transcriptPath ? fs.readFileSync(transcriptPath, 'utf8').trim().split(/\s+/).filter(Boolean).length : 0;
  const density = wordCount / Math.max(Number(record.duration) / 60, 1);
  const needsWhisper = !transcriptPath || (Number(record.duration) >= 300 && density < 40);

  const rawMediaPath = path.join(record.directory, `${record.id}.source.mp4`);
  const mediaResult = await runCommand('yt-dlp', [
    '--extractor-args', 'youtube:player_client=android', '-f', '18', '--no-warnings',
    '-o', rawMediaPath, record.url,
  ]);
  const audioPath = path.join(record.directory, `${record.id}.m4a`);
  const audioResult = mediaResult.code === 0 && fs.existsSync(rawMediaPath)
    ? await runCommand('ffmpeg', [
        '-hide_banner', '-loglevel', 'error', '-y', '-i', rawMediaPath,
        '-vn', '-c:a', 'aac', audioPath,
      ])
    : mediaResult;
  record.audioPath = audioPath;
  record.rawMediaPath = rawMediaPath;

  if (needsWhisper && audioResult.code === 0 && audioPath) {
    const result = await runCommand('uvx', [
      '--from', 'mlx-whisper', 'mlx_whisper', audioPath,
      '--model', 'mlx-community/whisper-large-v3-turbo', '--output-name', record.id,
      '--output-dir', record.directory, '--output-format', 'txt', '--verbose', 'False',
    ]);
    const whisperPath = path.join(record.directory, `${record.id}.txt`);
    if (result.code === 0 && fs.existsSync(whisperPath)) {
      transcriptPath = whisperPath;
      record.transcriptSource = 'whisper-large-v3-turbo';
    }
  } else if (transcriptPath) {
    record.transcriptSource = 'youtube-auto-caption';
  }

  if (!transcriptPath) {
    record.status = 'transcript-failed';
    record.error = audioResult.stderr.trim().split(/\r?\n/).at(-1) ?? 'No subtitle or audio transcript';
    return;
  }
  record.transcriptPath = transcriptPath;
  wordCount = fs.readFileSync(transcriptPath, 'utf8').trim().split(/\s+/).filter(Boolean).length;
  record.transcriptWordCount = wordCount;

  const visualPath = rawMediaPath;
  if (mediaResult.code !== 0 || !fs.existsSync(visualPath)) {
    record.status = 'visual-failed';
    record.error = mediaResult.stderr.trim().split(/\r?\n/).at(-1);
    return;
  }
  record.visualPath = visualPath;
  const sampleRate = Math.max(20 / Math.max(Number(record.duration) || 200, 20), 1 / 90);
  const sheetPath = path.join(record.directory, `${record.id}.sheet.jpg`);
  const sheetResult = await runCommand('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-i', visualPath,
    '-vf', `fps=${sampleRate},scale=270:-1,tile=5x4:padding=4:margin=4`, '-frames:v', '1', sheetPath,
  ]);
  if (sheetResult.code !== 0 || !fs.existsSync(sheetPath)) {
    record.status = 'sheet-failed';
    record.error = sheetResult.stderr.trim().split(/\r?\n/).at(-1);
    return;
  }
  record.sheetPath = sheetPath;
  record.status = 'review-ready';
});

const manifest = {
  preparedAt: new Date().toISOString(),
  outputDir: args.output,
  summary: records.reduce((summary, record) => {
    summary[record.status] = (summary[record.status] ?? 0) + 1;
    return summary;
  }, {}),
  records,
};
const manifestPath = path.join(args.output, 'manifest.youtube.json');
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ manifestPath, summary: manifest.summary }, null, 2));
