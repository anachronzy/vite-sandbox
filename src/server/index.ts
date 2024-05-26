import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer, type ViteDevServer } from 'vite';
import { withApiRoutes } from './controllers/index.js';

const BASE = process.env.BASE || '/';
const PORT = +(process.env.PORT || 0) || 3000;

const isProduction = process.env.NODE_ENV === 'production';
const __dirname = dirname(fileURLToPath(import.meta.url));

const templateHtml = isProduction
  ? await readFile(join(__dirname, 'client', 'index.html'), 'utf-8')
  : '';

const app = express();
let vite: ViteDevServer;

if (isProduction) {
  const sirv = (await import('sirv')).default;
  app.use(BASE, sirv(join(__dirname, 'client'), { extensions: [] }));
} else {
  vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
}

withApiRoutes(app);

app.use('*', async (req, res) => {
  const url = req.originalUrl.replace(BASE, '');
  let html = templateHtml;

  if (!isProduction) {
    html = await readFile('index.html', 'utf-8');
    html = await vite.transformIndexHtml(url, html);
  }

  res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
