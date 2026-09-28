export function normalizeDomain(input: string): string {
  const url = new URL(input.includes('://') ? input : `https://${input}`);
  if (url.protocol !== 'https:' || url.username || url.password || !url.hostname.includes('.') || url.port) throw new Error('Ange en giltig HTTPS-domän.');
  return url.hostname.replace(/^www\./, '').toLowerCase();
}

export function createQuestions(service: string, market: string): string[] {
  const s = service.trim().slice(0, 120);
  const m = market.trim().slice(0, 120);
  if (!s || !m) throw new Error('Ange tjänst och marknad.');
  return ['småföretag', 'ett växande företag', 'ett företag med begränsad budget'].flatMap(audience => [
    `Vilka leverantörer av ${s} i ${m} passar ${audience}?`,
    `Hur jämför ${audience} leverantörer av ${s} i ${m}?`,
    `Vad kostar ${s} för ${audience} i ${m}?`,
    `Vilka specialister på ${s} i ${m} har relevanta kundcase för ${audience}?`,
    `Vilka frågor bör ${audience} ställa inför köp av ${s} i ${m}?`,
    `Vilka alternativ till en stor leverantör av ${s} finns i ${m} för ${audience}?`,
    `Vilken leverantör av ${s} i ${m} erbjuder löpande stöd för ${audience}?`,
    `Hur hittar ${audience} rätt partner för ${s} i ${m}?`,
    `Vad bör ingå i en offert för ${s} till ${audience} i ${m}?`,
    `Vilka leverantörer av ${s} i ${m} redovisar sin arbetsprocess för ${audience}?`,
  ]);
}

export function safeSource(value: string): string | undefined {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}

type Evidence = { query: string; provider: string; mentioned: boolean; sourceUrl: string; checkedAt: string; note: string };
export function weeklyReport(brand: string, domain: string, observations: Evidence[], now = new Date()) {
  const cutoff = now.getTime() - 7 * 86400000;
  const rows = observations.filter(o => Date.parse(o.checkedAt) >= cutoff && Date.parse(o.checkedAt) <= now.getTime());
  const rate = rows.length ? `${Math.round(rows.filter(o => o.mentioned).length / rows.length * 100)}%` : 'Ej mätt';
  return [`# AI-synlighet · ${brand}`, domain, `Rapportdatum: ${now.toISOString().slice(0,10)}. Senaste sju dagarna.`, '',
    `Observationer: ${rows.length}. Omnämnandegrad i dessa stickprov: ${rate}.`,
    'API-svar och manuella stickprov är inte ett mått på alla användares AI-svar. Inga branschbenchmark finns i denna rapport.', '',
    ...rows.flatMap(o => [`## ${o.provider} · ${o.checkedAt}`, o.query, `Omnämnd: ${o.mentioned ? 'Ja' : 'Nej'}`, `Källa: ${safeSource(o.sourceUrl) ?? 'Ingen registrerad'}`, o.note, '']),
    '## Rekommenderat nästa steg', rows.length === 0 ? 'Samla verifierade svar innan slutsatser dras.' : 'Granska svaren och källorna. Rätta verifierade faktabrister och lägg prioriterade ändringar i åtgärdskön.',
  ].join('\n');
}
