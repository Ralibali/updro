import { describe, expect, it } from 'vitest';
import { createQuestions, normalizeDomain, safeSource, weeklyReport } from './planning';
describe('AI visibility evidence', () => {
  it('creates 30 distinct unbranded Swedish questions', () => {
    const questions = createQuestions('redovisning', 'Linköping');
    expect(new Set(questions).size).toBe(30);
    expect(questions.every(q => q.includes('redovisning') && q.includes('Linköping'))).toBe(true);
  });
  it('normalizes domains and rejects unsafe input', () => {
    expect(normalizeDomain('https://www.Example.se/path')).toBe('example.se');
    expect(() => normalizeDomain('javascript:alert(1)')).toThrow();
    expect(() => normalizeDomain('https://user:password@example.se')).toThrow();
    expect(safeSource('javascript:alert(1)')).toBeUndefined();
  });
  it('never reports missing evidence as zero visibility and excludes old/future observations', () => {
    const now = new Date('2026-09-28T12:00:00Z');
    const row = { query: 'test', provider: 'Perplexity', mentioned: true, sourceUrl: '', note: '', checkedAt: '2026-09-01T00:00:00Z' };
    expect(weeklyReport('Kund', 'kund.se', [row, { ...row, checkedAt: '2026-09-29T00:00:00Z' }], now)).toContain('Ej mätt');
    expect(weeklyReport('Kund', 'kund.se', [{ ...row, checkedAt: now.toISOString() }], now)).toContain('100%');
  });
});
