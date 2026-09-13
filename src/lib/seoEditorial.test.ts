import { expect, it } from 'vitest';
import { getAllStaticSeoRoutes, renderStaticHtml } from './seoStatic';
import articles from '../content/editorial/articles.json';
it.each(articles)('renders $slug before JavaScript runs', (article) => {
  const route = getAllStaticSeoRoutes().find(r => r.path === `/artiklar/${article.slug}`)!;
  const html = renderStaticHtml('<html><head></head><body><div id="root"></div></body></html>', route);
  expect(html).toContain(`<h1>${article.h1}</h1>`);
  expect(html).toContain(article.sections.at(-1)!.heading);
  for (const source of article.sources) {
    expect(html).toContain(`href="${source.href}"`);
  }
  expect(html).toContain('href="/publicera"');
  expect((html.match(/<h1/g) || []).length).toBe(1);
});
