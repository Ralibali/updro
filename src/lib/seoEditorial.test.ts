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
  for (const section of article.sections) {
    for (const [, label, href] of section.content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
      expect(html).toContain(`<a href="${href}">${label}</a>`);
      expect(html).not.toContain(`[${label}](${href})`);
    }
  }
  expect(html).toContain('href="/publicera"');
  expect((html.match(/<h1/g) || []).length).toBe(1);
});

it('escapes unsupported destinations and markup in static article links', () => {
  const route = getAllStaticSeoRoutes().find(r => r.path === `/artiklar/${articles[0].slug}`)!;
  const html = renderStaticHtml('<html><head></head><body><div id="root"></div></body></html>', {
    ...route,
    sections: [{ heading: 'Länkar', content: '[Intern](/publicera) [Extern](https://example.com/?a=1&b=2) [Osäker](javascript:alert) [Protokollrelativ](//example.com) [<img src=x onerror=alert>](https://example.com)' }],
  });
  expect(html).toContain('<a href="/publicera">Intern</a>');
  expect(html).toContain('<a href="https://example.com/?a=1&amp;b=2">Extern</a>');
  expect(html).not.toContain('href="javascript:');
  expect(html).not.toContain('href="//example.com');
  expect(html).not.toContain('<img src=x');
  expect(html).toContain('&lt;img src=x onerror=alert&gt;');
});
