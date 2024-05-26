import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import express from 'express';
import { withApiRoutes } from './controllers';

const BASE = process.env.BASE || '/';
const PORT = +(process.env.PORT || 0) || 3000;

const isProduction = process.env.NODE_ENV === 'production';

const createApp = async () => {
  const templateHtml = isProduction
    ? await readFile(join(__dirname, 'client', 'index.html'), 'utf-8')
    : '';

  const app = express();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let server: any;

  if (isProduction) {
    const sirv = (await import('sirv')).default;
    app.use(BASE, sirv(join(__dirname, 'client'), { extensions: [] }));
  } else {
    const vite = await import('vite');
    server = await vite.createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(server.middlewares);
  }

  withApiRoutes(app);

  app.use('*', async (req, res) => {
    const url = req.originalUrl.replace(BASE, '');
    let html = templateHtml;

    if (!isProduction) {
      html = await readFile('index.html', 'utf-8');
      html = await server.transformIndexHtml(url, html);
    }

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
  });

  app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
  });
};

createApp().catch((err) => console.log(err));
