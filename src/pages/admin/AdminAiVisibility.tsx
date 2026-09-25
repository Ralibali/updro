import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, CheckCircle2, Download, Plus, Trash2 } from "lucide-react";
import { AdminLayout } from "./AdminDashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
};

const STORAGE_KEY = "updro:ai-visibility:v1";

const emptyWorkspace: Workspace = {
  brand: "",
  domain: "",
  questions: "",
  observations: [],
  actions: [],
};

const providerOptions: Provider[] = ["ChatGPT", "Perplexity", "Google AI", "Copilot", "Claude"];

const actionLabels: Record<ActionKind, string> = {
  faktasida: "Faktasida",
  schema: "Schema / structured data",
  intern_lank: "Intern länkning",
  kallfix: "Rätta extern källa",
  content_brief: "Content brief",
};

const loadWorkspace = (): Workspace => {
  if (typeof window === "undefined") return emptyWorkspace;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyWorkspace;
    const parsed = JSON.parse(raw) as Partial<Workspace>;
    return {
      brand: typeof parsed.brand === "string" ? parsed.brand : "",
      domain: typeof parsed.domain === "string" ? parsed.domain : "",
      questions: typeof parsed.questions === "string" ? parsed.questions : "",
      observations: Array.isArray(parsed.observations) ? parsed.observations : [],
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    };
  } catch {
    return emptyWorkspace;
  }
};

const AdminAiVisibility = () => {
  const [workspace, setWorkspace] = useState<Workspace>(loadWorkspace);
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
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
      mentionRate: total ? Math.round((mentions / total) * 100) : 0,
      providers,
      open,
    };
  }, [workspace.actions, workspace.observations]);

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
          checkedAt: new Date().toISOString(),
        },
        ...current.observations,
      ],
    }));
    setObservation((current) => ({ ...current, query: "", sourceUrl: "", note: "" }));
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

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Pilotlagret sparar arbetsytan i den här webbläsaren. Det gör att vi kan använda flödet direkt
          utan att låtsas att ChatGPT, Google eller Perplexity är integrerade. Nästa steg är serverlagring
          och provider-connector när vi har verifierat vilka flöden som används i praktiken.
        </div>

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
            ["Omnämnandegrad", `${stats.mentionRate}%`],
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
                <Input id="visibility-query" value={observation.query} onChange={(event) => setObservation((current) => ({ ...current, query: event.target.value }))} />
              </div>
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
                  {item.sourceUrl ? <a className="mt-2 block break-all text-xs text-primary underline" href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceUrl}</a> : null}
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
    </AdminLayout>
  );
};

export default AdminAiVisibility;
