import { expect, it } from 'vitest';
import { getAllStaticSeoRoutes, renderStaticHtml } from './seoStatic';
import articles from '../content/editorial/articles.json';
it('renders the complete editorial article before JavaScript runs', () => {
  const article = articles[0];
  const route = getAllStaticSeoRoutes().find(r => r.path === `/artiklar/${article.slug}`)!;
  const html = renderStaticHtml('<html><head></head><body><div id="root"></div></body></html>', route);
  expect(html).toContain(`<h1>${article.h1}</h1>`);
  expect(html).toContain(article.sections.at(-1)!.heading);
  expect(html).toContain('href="https://www.w3.org/WAI/test-evaluate/easy-checks/"');
  expect(html).toContain('href="/publicera"');
  expect((html.match(/<h1/g) || []).length).toBe(1);
});
