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

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      let template = readFileSync('index.html', 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      const { render } = await vite.ssrLoadModule(
        'src/client/entry-server.tsx',
      );
      const appHtml = render(url);
      const html = template.replace('<!--ssr-outlet-->', appHtml);
      res.set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      if (e instanceof Error) {
        vite.ssrFixStacktrace(e);
      }
      next(e);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
  });
};

createServer().catch((err) => console.error(err));
