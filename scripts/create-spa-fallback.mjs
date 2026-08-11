import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';

const indexPath = fileURLToPath(new URL('../dist/index.html', import.meta.url));
const fallbackPath = fileURLToPath(new URL('../dist/404.html', import.meta.url));
const staticRoutes = ['reels', 'youtube', 'reels-research', 'youtube-research'];

await copyFile(indexPath, fallbackPath);

for (const route of staticRoutes) {
  const routeDirectory = fileURLToPath(new URL(`../dist/${route}/`, import.meta.url));
  await mkdir(routeDirectory, { recursive: true });
  await copyFile(indexPath, `${routeDirectory}index.html`);
}
