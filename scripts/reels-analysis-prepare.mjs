import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inventoryPath = path.join(
  rootDir,
  'research/reels-inventory/facebook-login-2026-08-06.json',
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
};

const options = process.argv.slice(2).reduce(
  (result, argument) => {
    const [name, value] = argument.split('=', 2);
    if (name === '--per-source') result.perSource = Number(value);
    if (name === '--source') result.sources.push(value);
    if (name === '--output') result.output = path.resolve(value);
    if (name === '--concurrency') result.concurrency = Number(value);
    if (name === '--skip-visuals') result.visuals = false;
    return result;
  },
  { perSource: 1, sources: [], output: null, concurrency: 3, visuals: true },
);

if (!Number.isInteger(options.perSource) || options.perSource < 1) {
  throw new Error('--per-source must be a positive integer');
}
if (!Number.isInteger(options.concurrency) || options.concurrency < 1) {
  throw new Error('--concurrency must be a positive integer');
}

const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
const deferredIds = new Set(checkpoint.deferred.map(({ id }) => id));
const selectedSources = options.sources.length
  ? new Set(options.sources)
  : new Set(Object.keys(sourceFiles));
const unknownSources = [...selectedSources].filter((slug) => !sourceFiles[slug]);
if (unknownSources.length) {
  throw new Error(`Unknown source slug: ${unknownSources.join(', ')}`);
}

const analyzedIdsBySource = new Map(
  Object.entries(sourceFiles).map(([slug, relativePath]) => {
    const source = fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
    const ids = [...source.matchAll(/\bid:\s*['"](\d+)['"]/g)].map(
      (match) => match[1],
    );
    return [slug, new Set(ids)];
  }),
);

const selection = inventory.sources.flatMap((source) => {
  if (!selectedSources.has(source.slug)) return [];
  const analyzedIds = analyzedIdsBySource.get(source.slug);
  return source.reelIds
    .filter((id) => !analyzedIds.has(id) && !deferredIds.has(id))
    .slice(0, options.perSource)
    .map((id) => ({
      slug: source.slug,
      id,
      url: `https://www.facebook.com/reel/${id}/`,
    }));
});

if (!selection.length) {
  console.log('No pending Reels matched the requested selection.');
  process.exit(0);
}

const outputDir = options.output
  ? fs.mkdirSync(options.output, { recursive: true }) ?? options.output
  : fs.mkdtempSync(path.join(os.tmpdir(), 'hiddenriches-reels-'));

const runCommand = (command, args) =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout = `${stdout}${chunk}`.slice(-20_000);
    });
    child.stderr.on('data', (chunk) => {
      stderr = `${stderr}${chunk}`.slice(-20_000);
    });
    child.on('error', (error) => {
      resolve({ code: -1, stdout, stderr: `${stderr}\n${error.message}`.trim() });
    });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const runPool = async (items, concurrency, worker) => {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await worker(items[index]);
      }
    },
  );
  await Promise.all(runners);
  return results;
};

const findFile = (directory, predicate) =>
  fs
    .readdirSync(directory)
    .map((name) => path.join(directory, name))
    .find((filePath) => predicate(path.basename(filePath))) ?? null;

const getFallbackMediaUrl = (infoPath) => {
  const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
  const formats = Array.isArray(info.formats) ? info.formats : [];
  return (
    formats.find(({ format_id: formatId }) => formatId === 'sd')?.url ??
    formats.find(({ url }) => url)?.url ??
    null
  );
};

const cleanSubtitle = (subtitle) =>
  subtitle
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter(
      (line) =>
        line.trim() &&
        !/^\d+$/.test(line.trim()) &&
        !/-->/.test(line) &&
        !/^WEBVTT/.test(line.trim()),
    )
    .join(' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const records = await runPool(selection, options.concurrency, async (item) => {
  const sourceDir = path.join(outputDir, item.slug);
  fs.mkdirSync(sourceDir, { recursive: true });
  const outputTemplate = path.join(sourceDir, '%(id)s.%(ext)s');
  let metadataResult;
  let infoPath;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    metadataResult = await runCommand('yt-dlp', [
      '--skip-download',
      '--write-info-json',
      '--write-auto-subs',
      '--sub-langs',
      'en_US,en.*,ko_KR,ko.*',
      '--sub-format',
      'srt',
      '--write-thumbnail',
      '--convert-thumbnails',
      'jpg',
      '--no-warnings',
      '-o',
      outputTemplate,
      item.url,
    ]);
    infoPath = findFile(sourceDir, (name) => name === `${item.id}.info.json`);
    if (metadataResult.code === 0 && infoPath) break;
    if (attempt < 3) await wait(attempt * 2_000);
  }

  if (metadataResult.code !== 0 || !infoPath) {
    return {
      ...item,
      status: 'metadata-failed',
      error: metadataResult.stderr.trim().split(/\r?\n/).at(-1) ?? 'unknown error',
    };
  }

  const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
  return {
    ...item,
    status: 'metadata-ready',
    infoPath,
    title: info.title ?? null,
    description: info.description ?? null,
    uploader: info.uploader ?? null,
    uploadDate: info.upload_date ?? null,
    duration: info.duration ?? null,
  };
});

for (const record of records) {
  if (record.status === 'metadata-failed') continue;
  const sourceDir = path.join(outputDir, record.slug);
  const subtitlePath = findFile(
    sourceDir,
    (name) => name.startsWith(`${record.id}.`) && name.endsWith('.srt'),
  );

  if (subtitlePath) {
    const transcriptPath = path.join(sourceDir, `${record.id}.transcript.txt`);
    fs.writeFileSync(
      transcriptPath,
      `${cleanSubtitle(fs.readFileSync(subtitlePath, 'utf8'))}\n`,
    );
    record.transcriptPath = transcriptPath;
    record.transcriptSource = 'facebook-auto-caption';
  } else {
    let audioResult = await runCommand('yt-dlp', [
      '-f',
      'bestaudio/best',
      '-x',
      '--audio-format',
      'm4a',
      '--no-warnings',
      '-o',
      path.join(sourceDir, '%(id)s.%(ext)s'),
      record.url,
    ]);
    let audioPath = findFile(sourceDir, (name) => name === `${record.id}.m4a`);
    if (audioResult.code !== 0 || !audioPath) {
      const fallbackUrl = getFallbackMediaUrl(record.infoPath);
      const fallbackAudioPath = path.join(sourceDir, `${record.id}.m4a`);
      if (fallbackUrl) {
        audioResult = await runCommand('ffmpeg', [
          '-hide_banner',
          '-loglevel',
          'error',
          '-y',
          '-i',
          fallbackUrl,
          '-vn',
          '-c:a',
          'aac',
          fallbackAudioPath,
        ]);
        audioPath = fs.existsSync(fallbackAudioPath) ? fallbackAudioPath : null;
      }
    }
    if (audioResult.code === 0 && audioPath) {
      const transcriptResult = await runCommand('uvx', [
        '--from',
        'mlx-whisper',
        'mlx_whisper',
        audioPath,
        '--model',
        'mlx-community/whisper-large-v3-turbo',
        '--output-name',
        record.id,
        '--output-dir',
        sourceDir,
        '--output-format',
        'txt',
        '--verbose',
        'False',
      ]);
      const transcriptPath = path.join(sourceDir, `${record.id}.txt`);
      if (transcriptResult.code === 0 && fs.existsSync(transcriptPath)) {
        record.transcriptPath = transcriptPath;
        record.transcriptSource = 'whisper-large-v3-turbo';
      } else {
        record.status = 'transcript-failed';
        record.error = transcriptResult.stderr.trim().split(/\r?\n/).at(-1);
      }
    } else {
      record.status = 'audio-failed';
      record.error = audioResult.stderr.trim().split(/\r?\n/).at(-1);
    }
  }

  if (!record.transcriptPath || !options.visuals) continue;
  let visualResult = await runCommand('yt-dlp', [
    '-f',
    'worstvideo[ext=mp4]/worstvideo',
    '--no-warnings',
    '-o',
    path.join(sourceDir, '%(id)s.visual.%(ext)s'),
    record.url,
  ]);
  let visualPath = findFile(sourceDir, (name) =>
    name.startsWith(`${record.id}.visual.`),
  );
  if (visualResult.code !== 0 || !visualPath) {
    visualResult = await runCommand('yt-dlp', [
      '-f',
      'sd',
      '--no-warnings',
      '-o',
      path.join(sourceDir, '%(id)s.visual.%(ext)s'),
      record.url,
    ]);
    visualPath = findFile(sourceDir, (name) =>
      name.startsWith(`${record.id}.visual.`),
    );
  }
  if (visualResult.code !== 0 || !visualPath) {
    const fallbackUrl = getFallbackMediaUrl(record.infoPath);
    const fallbackVisualPath = path.join(sourceDir, `${record.id}.visual.mp4`);
    if (fallbackUrl) {
      visualResult = await runCommand('ffmpeg', [
        '-hide_banner',
        '-loglevel',
        'error',
        '-y',
        '-i',
        fallbackUrl,
        '-c',
        'copy',
        fallbackVisualPath,
      ]);
      visualPath = fs.existsSync(fallbackVisualPath) ? fallbackVisualPath : null;
    }
  }
  if (visualResult.code !== 0 || !visualPath) {
    record.visualStatus = 'download-failed';
    continue;
  }

  const sampleRate = Math.max(20 / Math.max(Number(record.duration) || 200, 20), 1 / 90);
  const sheetPath = path.join(sourceDir, `${record.id}.sheet.jpg`);
  const sheetResult = await runCommand('ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    visualPath,
    '-vf',
    `fps=${sampleRate},scale=270:-1,tile=5x4:padding=4:margin=4`,
    '-frames:v',
    '1',
    sheetPath,
  ]);
  if (sheetResult.code === 0 && fs.existsSync(sheetPath)) {
    record.sheetPath = sheetPath;
    record.visualStatus = 'ready';
  } else {
    record.visualStatus = 'sheet-failed';
  }
}

for (const record of records) {
  if (record.transcriptPath && record.status === 'metadata-ready') {
    record.status = 'review-ready';
  }
}

const manifest = {
  preparedAt: new Date().toISOString(),
  outputDir,
  options,
  summary: records.reduce((result, record) => {
    result[record.status] = (result[record.status] ?? 0) + 1;
    return result;
  }, {}),
  records,
};
const manifestPath = path.join(outputDir, 'manifest.json');
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(JSON.stringify({ outputDir, manifestPath, summary: manifest.summary }, null, 2));
for (const record of records) {
  console.log(`${record.slug}\t${record.id}\t${record.status}`);
}
