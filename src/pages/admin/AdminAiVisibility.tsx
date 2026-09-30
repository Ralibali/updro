import { supabase } from "@/integrations/supabase/client";
import { createQuestions, normalizeDomain, safeSource, weeklyReport } from "@/features/visibility/planning";
import { listWorkspaces, saveWorkspace, listMeasurements, type Measurement, type SavedWorkspace } from "@/features/visibility/storage";
import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, CalendarClock, CheckCircle2, Download, Plus, Trash2 } from "lucide-react";
import { AdminLayout } from "./AdminDashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VISIBILITY_PLANS, formatVisibilityCadence, nextVisibilityRun, normalizeVisibilityPlanKey, type VisibilityPlanKey } from "@/features/visibility/plans";

type Provider = "ChatGPT" | "Perplexity" | "Google AI" | "Copilot" | "Claude";
type ActionKind = "faktasida" | "schema" | "intern_lank" | "kallfix" | "content_brief";

type Observation = {
  id: string;
  provider: Provider;
  query: string;
  mentioned: boolean;
  sourceUrl: string;
  note: string;
  checkedAt: string;
};

type VisibilityAction = {
  id: string;
  kind: ActionKind;
  target: string;
  note: string;
  status: "open" | "done";
  createdAt: string;
};

type Workspace = {
  brand: string;
  domain: string;
  questions: string;
  observations: Observation[];
  actions: VisibilityAction[];
  planKey: VisibilityPlanKey;
  lastRunAt: string | null;
  nextRunAt: string | null;
};

const STORAGE_KEY = "updro:ai-visibility:v1";

const emptyWorkspace: Workspace = {
  brand: "",
  domain: "",
  questions: "",
  observations: [],
  actions: [],
  planKey: "monitor",
  lastRunAt: null,
  nextRunAt: null,
};

const providerOptions: Provider[] = ["ChatGPT", "Perplexity", "Google AI", "Copilot", "Claude"];

const actionLabels: Record<ActionKind, string> = {
  faktasida: "Faktasida",
  schema: "Schema / structured data",
  intern_lank: "Intern länkning",
  kallfix: "Rätta extern källa",
  content_brief: "Content brief",
};

const normalizeWorkspace = (value: unknown): Workspace => {
  const parsed = (value && typeof value === "object" ? value : {}) as Partial<Workspace>;
  return {
    brand: typeof parsed.brand === "string" ? parsed.brand : "",
    domain: typeof parsed.domain === "string" ? parsed.domain : "",
    questions: typeof parsed.questions === "string" ? parsed.questions : "",
    observations: Array.isArray(parsed.observations) ? parsed.observations : [],
    actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    planKey: normalizeVisibilityPlanKey(parsed.planKey),
    lastRunAt: typeof parsed.lastRunAt === "string" ? parsed.lastRunAt : null,
    nextRunAt: typeof parsed.nextRunAt === "string" ? parsed.nextRunAt : null,
  };
};

const loadWorkspace = (): Workspace => {
  if (typeof window === "undefined") return emptyWorkspace;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeWorkspace(JSON.parse(raw)) : emptyWorkspace;
  } catch {
    return emptyWorkspace;
  }
};

const AdminAiVisibility = () => {
  const [workspace, setWorkspace] = useState<Workspace>(loadWorkspace);
  const [cloud, setCloud] = useState<SavedWorkspace[]>([]);
  const [selected, setSelected] = useState<SavedWorkspace | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [service, setService] = useState("");
  const [market, setMarket] = useState("Sverige");
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  useEffect(() => {
    let active = true;
    setMeasurements([]);
    if (selected?.id) listMeasurements(selected.id).then(rows => { if (active) setMeasurements(rows); }).catch(e => { if (active) setMessage(e.message); });
    return () => { active = false; };
  }, [selected?.id]);
  const [evidenceAt, setEvidenceAt] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const selectedPlan = VISIBILITY_PLANS[workspace.planKey];
  useEffect(() => { listWorkspaces().then(setCloud).catch(e => setMessage(e.message)); }, []);
  const saveCloud = async () => {
    setBusy(true);
    try {
      if (!workspace.brand.trim()) throw new Error("Ange kundens namn.");
      const normalized = { ...workspace, domain: normalizeDomain(workspace.domain) };
      const saved = await saveWorkspace(selected?.id ?? null, selected?.revision ?? 0, workspace.brand.trim(), normalized);
      setSelected(saved); setWorkspace(normalized);
      setCloud(current => [saved, ...current.filter(item => item.id !== saved.id)]);
      setMessage("Sparat på servern.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Kunde inte spara."); }
    finally { setBusy(false); }
  };
  const measure = async () => {
    if (!selected) return;
    setBusy(true); setAnswer("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-visibility-check", { body: { workspaceId: selected.id, prompt: observation.query } });
      if (error) {
        const details = await error.context?.json?.().catch(() => null);
        throw new Error(details?.error ?? "Mätningen kunde inte genomföras.");
      }
      if (data.error) throw new Error(data.error);
      setMeasurements(await listMeasurements(selected.id));
      setEvidenceAt(data.checkedAt);
      setAnswer(data.answer);
      setObservation(current => ({ ...current, provider: "Perplexity", sourceUrl: data.citations[0] ?? "", note: `Sonar API (${data.model}), ${data.checkedAt}\n${data.answer}\nKällor: ${data.citations.join(", ")}`, mentioned: false }));
      setMessage("Granska svaret och markera om varumärket nämns innan du lägger till observationen. API-svar är inte samma sak som konsumenttjänstens svar.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Mätningen misslyckades."); }
    finally { setBusy(false); }
  };
  const [saved, setSaved] = useState(false);
  const [observation, setObservation] = useState({
    provider: "ChatGPT" as Provider,
    query: "",
    mentioned: true,
    sourceUrl: "",
    note: "",
  });
  const [action, setAction] = useState({
    kind: "faktasida" as ActionKind,
    target: "",
    note: "",
  });

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace)); } catch { setMessage("Lokalt sparande misslyckades. Exportera eller spara på servern."); return; }
    setSaved(true);
    const timeout = window.setTimeout(() => setSaved(false), 1200);
    return () => window.clearTimeout(timeout);
  }, [workspace]);

  const stats = useMemo(() => {
    const total = workspace.observations.length;
    const mentions = workspace.observations.filter((item) => item.mentioned).length;
    const providers = new Set(workspace.observations.map((item) => item.provider)).size;
    const open = workspace.actions.filter((item) => item.status === "open").length;
    return {
      total,
      mentionRate: total ? `${Math.round((mentions / total) * 100)}%` : "Ej mätt",
      providers,
      open,
    };
  }, [workspace.actions, workspace.observations]);

  const scheduleNextRun = (completed = false) => {
    const now = new Date();
    const next = nextVisibilityRun(selectedPlan.cadence, now).toISOString();
    setWorkspace((current) => ({
      ...current,
      lastRunAt: completed ? now.toISOString() : current.lastRunAt,
      nextRunAt: next,
    }));
    setMessage(
      completed
        ? `Kontrollen markerades klar. Nästa uppföljning är planerad ${new Date(next).toLocaleDateString("sv-SE")}.`
        : `Nästa uppföljning är planerad ${new Date(next).toLocaleDateString("sv-SE")}.`,
    );
  };

  const addObservation = () => {
    const query = observation.query.trim();
    if (!query) return;
    setWorkspace((current) => ({
      ...current,
      observations: [
        {
          id: crypto.randomUUID(),
          provider: observation.provider,
          query,
          mentioned: observation.mentioned,
          sourceUrl: observation.sourceUrl.trim(),
          note: observation.note.trim(),
          checkedAt: evidenceAt ?? new Date().toISOString(),
        },
        ...current.observations,
      ],
    }));
    setObservation((current) => ({ ...current, query: "", sourceUrl: "", note: "" }));
    setEvidenceAt(null); setAnswer("");
  };

  const addAction = () => {
    const target = action.target.trim();
    if (!target) return;
    setWorkspace((current) => ({
      ...current,
      actions: [
        {
          id: crypto.randomUUID(),
          kind: action.kind,
          target,
          note: action.note.trim(),
          status: "open",
          createdAt: new Date().toISOString(),
        },
        ...current.actions,
      ],
    }));
    setAction((current) => ({ ...current, target: "", note: "" }));
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `updro-ai-synlighet-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <fieldset disabled={busy} className="contents">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Updro · execution workspace
            </p>
            <h1 className="mt-2 flex items-center gap-2 font-display text-3xl font-bold tracking-tight">
              <BrainCircuit className="h-7 w-7" /> AI-synlighet
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Dokumentera vad AI-tjänster faktiskt svarar, vilka källor de använder och gör varje fynd
              till en konkret åtgärd. Ingen automatisk publicering sker här.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {saved ? <Badge variant="secondary">Sparat lokalt</Badge> : null}
            <Button variant="outline" onClick={exportJson}>
              <Download className="mr-2 h-4 w-4" /> Exportera JSON
            </Button>
          </div>
        </div>

        <section className="space-y-3 rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Kundarbetsytor</h2>
          <p className="text-sm text-muted-foreground">Ändringar sparas som lokalt utkast. Spara på servern för att dela med andra Updro-administratörer. Alla administratörer kan läsa kundarbetsytorna.</p>
          <Label htmlFor="cloud-workspace">Sparad kund</Label>
          <select id="cloud-workspace" className="w-full rounded border p-2" value={selected?.id ?? ""} disabled={busy} onChange={event => {
            if (!window.confirm("Byta arbetsyta? Osparade ändringar i den nuvarande vyn ersätts.")) return;
            const next = cloud.find(item => item.id === event.target.value) ?? null;
            setSelected(next); setEvidenceAt(null); setWorkspace(next ? normalizeWorkspace(next.workspace) : { ...emptyWorkspace }); setAnswer("");
          }}>
            <option value="">Ny kund / lokalt utkast</option>
            {cloud.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}
          </select>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={saveCloud}>Spara kund på servern</Button>
            <Button variant="outline" onClick={() => {
              const url = URL.createObjectURL(new Blob([weeklyReport(workspace.brand, workspace.domain, workspace.observations)], { type: "text/markdown" }));
              const a = document.createElement("a"); a.href = url; a.download = "ai-synlighet-veckorapport.md"; a.click(); URL.revokeObjectURL(url);
            }}>Hämta veckorapport</Button>
          </div>
          {measurements.length > 0 && <details><summary>Mäthistorik ({measurements.length} senaste)</summary><ul className="space-y-2">{measurements.map(item => <li key={item.id} className="rounded border p-2 text-sm">
            {new Date(item.created_at).toLocaleString("sv-SE")} · {item.prompt} · {item.status === "complete" ? "Klart" : item.status === "failed" ? "Misslyckades" : "Ej slutförd"}
            {item.result && <Button variant="outline" size="sm" onClick={() => { const result = item.result!; setAnswer(result.answer); setEvidenceAt(result.checkedAt); setObservation({ provider: "Perplexity", query: item.prompt, mentioned: false, sourceUrl: result.citations[0] ?? "", note: `Sonar API (${result.model}), ${result.checkedAt}\n${result.answer}` }); }}>Granska svar</Button>}
          </li>)}</ul></details>}
          {message && <p role="status" className="text-sm">{message}</p>}
          <div className="grid gap-3 md:grid-cols-2">
            <div><Label htmlFor="visibility-service">Tjänst att undersöka</Label><Input id="visibility-service" value={service} onChange={e => setService(e.target.value)} placeholder="Webbutveckling" /></div>
            <div><Label htmlFor="visibility-market">Marknad / ort</Label><Input id="visibility-market" value={market} onChange={e => setMarket(e.target.value)} /></div>
          </div>
          <Button variant="outline" disabled={!service.trim() || !market.trim()} onClick={() => {
            if (workspace.questions && !window.confirm("Ersätta befintliga testfrågor med 30 nya förslag?")) return;
            setWorkspace(current => ({ ...current, questions: createQuestions(service, market).join("\n") }));
          }}>Skapa 30 svenska testfrågor</Button>
          <p className="text-xs text-muted-foreground">Förslagen bygger på angiven tjänst och marknad, inte uppmätt sökvolym. Granska dem före mätning.</p>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Visibility Cloud · kommersiell arbetsyta
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold">Plan och uppföljningsrytm</h2>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                Detta planerar arbetet i kundarbetsytan. Det startar inget dolt cron-jobb och gör inga
                externa mätningar automatiskt.
              </p>
            </div>
            <Badge variant="secondary">{selectedPlan.priceSek.toLocaleString("sv-SE")} kr/mån</Badge>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="visibility-plan">Paket</Label>
              <select
                id="visibility-plan"
                className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={workspace.planKey}
                onChange={(event) => {
                  const planKey = normalizeVisibilityPlanKey(event.target.value);
                  setWorkspace((current) => ({ ...current, planKey, nextRunAt: null }));
                }}
              >
                {Object.values(VISIBILITY_PLANS).map((plan) => (
                  <option key={plan.key} value={plan.key}>{plan.name} · {plan.priceSek} kr/mån</option>
                ))}
              </select>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Rytm</p>
              <p className="mt-1 font-semibold">{formatVisibilityCadence(selectedPlan.cadence)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Frågor i paket</p>
              <p className="mt-1 font-semibold">{selectedPlan.trackedQueryLimit.toLocaleString("sv-SE")}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Arbetsytor</p>
              <p className="mt-1 font-semibold">{selectedPlan.workspaceLimit}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={() => scheduleNextRun(false)}>
              <CalendarClock className="mr-2 h-4 w-4" /> Planera nästa kontroll
            </Button>
            <Button type="button" onClick={() => scheduleNextRun(true)}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Markera kontroll klar
            </Button>
            <span className="text-xs text-muted-foreground">
              {workspace.nextRunAt
                ? `Nästa: ${new Date(workspace.nextRunAt).toLocaleDateString("sv-SE")}`
                : "Ingen nästa kontroll planerad"}
              {workspace.lastRunAt
                ? ` · Senast klar: ${new Date(workspace.lastRunAt).toLocaleDateString("sv-SE")}`
                : ""}
            </span>
          </div>
        </section>

        <section className="grid gap-4 rounded-xl border bg-card p-5 md:grid-cols-3">
          <div>
            <Label htmlFor="visibility-brand">Kund / varumärke</Label>
            <Input
              id="visibility-brand"
              value={workspace.brand}
              onChange={(event) => setWorkspace((current) => ({ ...current, brand: event.target.value }))}
              placeholder="Kund AB"
            />
          </div>
          <div>
            <Label htmlFor="visibility-domain">Domän</Label>
            <Input
              id="visibility-domain"
              value={workspace.domain}
              onChange={(event) => setWorkspace((current) => ({ ...current, domain: event.target.value }))}
              placeholder="kund.se"
            />
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="visibility-questions">Prioriterade köpfrågor</Label>
            <Textarea
              id="visibility-questions"
              rows={4}
              value={workspace.questions}
              onChange={(event) => setWorkspace((current) => ({ ...current, questions: event.target.value }))}
              placeholder={"En fråga per rad, t.ex.\nVilken webbyrå i Linköping passar ett mindre industribolag?"}
            />
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Observationer", stats.total],
            ["Omnämnandegrad", stats.mentionRate],
            ["AI-tjänster testade", stats.providers],
            ["Öppna åtgärder", stats.open],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 font-display text-2xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Ny observation</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Registrera verifierade stickprov med datum. Skriv inte in ett resultat som inte är kontrollerat.
            </p>
            <div className="mt-4 grid gap-3">
              <div>
                <Label htmlFor="visibility-provider">AI-tjänst</Label>
                <select
                  id="visibility-provider"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={observation.provider}
                  onChange={(event) => setObservation((current) => ({ ...current, provider: event.target.value as Provider }))}
                >
                  {providerOptions.map((provider) => <option key={provider}>{provider}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="visibility-query">Fråga som testades</Label>
                <datalist id="visibility-prompts">{workspace.questions.split("\n").filter(Boolean).map((q, i) => <option key={i} value={q} />)}</datalist>
                <Input list="visibility-prompts" id="visibility-query" value={observation.query} onChange={(event) => setObservation((current) => ({ ...current, query: event.target.value }))} />
              </div>
              <Button variant="outline" disabled={busy || !selected || !observation.query.trim()} onClick={measure}>{busy ? "Arbetar…" : "Mät frågan med Sonar API"}</Button>
              <p className="text-xs text-muted-foreground">Kräver aktiverad serveranslutning. En fråga per anrop, högst ett försök per sparad fråga och dag. Kostnad kan tillkomma hos leverantören.</p>
              {answer && <pre className="whitespace-pre-wrap rounded border p-3 text-sm">{answer}</pre>}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={observation.mentioned} onChange={(event) => setObservation((current) => ({ ...current, mentioned: event.target.checked }))} />
                Varumärket nämndes i svaret
              </label>
              <div>
                <Label htmlFor="visibility-source">Viktigaste källan / URL</Label>
                <Input id="visibility-source" value={observation.sourceUrl} onChange={(event) => setObservation((current) => ({ ...current, sourceUrl: event.target.value }))} placeholder="https://…" />
              </div>
              <div>
                <Label htmlFor="visibility-note">Notering</Label>
                <Textarea id="visibility-note" rows={3} value={observation.note} onChange={(event) => setObservation((current) => ({ ...current, note: event.target.value }))} placeholder="Vad saknades, var konkurrenten starkare, vad behöver rättas?" />
              </div>
              <Button type="button" onClick={addObservation} disabled={!observation.query.trim()}>
                <Plus className="mr-2 h-4 w-4" /> Lägg till observation
              </Button>
            </div>

            <div className="mt-5 space-y-2">
              {workspace.observations.map((item) => (
                <article key={item.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={item.mentioned ? "default" : "secondary"}>{item.provider}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(item.checkedAt).toLocaleString("sv-SE")}</span>
                    <button
                      type="button"
                      aria-label="Ta bort observation"
                      className="ml-auto text-muted-foreground hover:text-destructive"
                      onClick={() => setWorkspace((current) => ({ ...current, observations: current.observations.filter((row) => row.id !== item.id) }))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm font-medium">{item.query}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.mentioned ? "Nämnd" : "Inte nämnd"}{item.note ? ` · ${item.note}` : ""}</p>
                  {item.sourceUrl ? <a className="mt-2 block break-all text-xs text-primary underline" href={safeSource(item.sourceUrl)} target="_blank" rel="noreferrer">{item.sourceUrl}</a> : null}
                </article>
              ))}
              {workspace.observations.length === 0 ? <p className="text-sm text-muted-foreground">Inga observationer ännu.</p> : null}
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Åtgärdskö</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Gör analysen till leverans: varje fynd ska landa i något som kan byggas, rättas eller publiceras.
            </p>
            <div className="mt-4 grid gap-3">
              <div>
                <Label htmlFor="visibility-kind">Åtgärdstyp</Label>
                <select
                  id="visibility-kind"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={action.kind}
                  onChange={(event) => setAction((current) => ({ ...current, kind: event.target.value as ActionKind }))}
                >
                  {Object.entries(actionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="visibility-target">Sida / mål</Label>
                <Input id="visibility-target" value={action.target} onChange={(event) => setAction((current) => ({ ...current, target: event.target.value }))} placeholder="/tjanster/seo eller extern källa" />
              </div>
              <div>
                <Label htmlFor="visibility-action-note">Vad ska göras?</Label>
                <Textarea id="visibility-action-note" rows={3} value={action.note} onChange={(event) => setAction((current) => ({ ...current, note: event.target.value }))} />
              </div>
              <Button type="button" onClick={addAction} disabled={!action.target.trim()}>
                <Plus className="mr-2 h-4 w-4" /> Lägg i kön
              </Button>
            </div>

            <div className="mt-5 space-y-2">
              {workspace.actions.map((item) => (
                <article key={item.id} className="rounded-lg border p-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      aria-label={item.status === "done" ? "Öppna åtgärd igen" : "Markera som klar"}
                      className={item.status === "done" ? "text-emerald-600" : "text-muted-foreground"}
                      onClick={() => setWorkspace((current) => ({
                        ...current,
                        actions: current.actions.map((row) => row.id === item.id ? { ...row, status: row.status === "done" ? "open" : "done" } : row),
                      }))}
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{actionLabels[item.kind]}</Badge>
                        <Badge variant={item.status === "done" ? "secondary" : "default"}>{item.status === "done" ? "Klar" : "Öppen"}</Badge>
                      </div>
                      <p className={`mt-2 break-words text-sm font-medium ${item.status === "done" ? "line-through opacity-60" : ""}`}>{item.target}</p>
                      {item.note ? <p className="mt-1 text-xs text-muted-foreground">{item.note}</p> : null}
                    </div>
                    <button
                      type="button"
                      aria-label="Ta bort åtgärd"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setWorkspace((current) => ({ ...current, actions: current.actions.filter((row) => row.id !== item.id) }))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
              {workspace.actions.length === 0 ? <p className="text-sm text-muted-foreground">Ingen åtgärd i kön ännu.</p> : null}
            </div>
          </section>
        </div>
      </div>
      </fieldset>
    </AdminLayout>
  );
};

export default AdminAiVisibility;
