import { renderToString } from 'react-dom/server';

import App from './App';

export const render = (_url: URL, { context }: { context: number }) => {
  const html = renderToString(<App value={context} />);
  const script = `<script>window._ssr_props = { context: ${context}}</script>`;

  return { html, head: script };
};
