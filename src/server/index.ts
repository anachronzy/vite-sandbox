import { readFileSync } from 'node:fs';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const PORT = +(process.env.PORT || 0) || 3000;

const createServer = async () => {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res) => {
    let html = readFileSync('index.html', 'utf-8');
    html = await vite.transformIndexHtml(req.url, html);

    res.set({ 'Content-Type': 'text/html' }).send(html);
  });

  app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
  });
};

createServer().catch((err) => console.error(err));
