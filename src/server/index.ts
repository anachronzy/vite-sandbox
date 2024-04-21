import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer, type ViteDevServer } from 'vite';

const BASE = process.env.BASE || '/';
const PORT = +(process.env.PORT || 0) || 3000;
const HOSTNAME = process.env.HOST || 'localhost';

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

app.use('*', async (req, res, next) => {
  const url = req.originalUrl.replace(BASE, '');
  let template = '';
  let render: (url: URL) => { html: string };

  try {
    if (isProduction) {
      template = templateHtml;
      // @ts-expect-error TS2307
      render = (await import('./server/entry-server.js')).render;
    } else {
      template = await readFile('index.html', 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule('src/client/entry-server.tsx')).render;
    }

    const content = render(new URL(url, `https://${HOSTNAME}:${PORT}`));

    const html = template.replace('<!--app-html-->', content.html);

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
  } catch (e) {
    if (e instanceof Error) {
      vite?.ssrFixStacktrace(e);
      console.error(e.stack);
    }
    next(e);
  }
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
