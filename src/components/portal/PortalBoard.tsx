import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PortalForm from "./PortalForm";
import {
  type AgencyPortal,
  type PortalAction,
  invoiceBasis,
  portalDate,
  portalMoney,
  priceToOre,
  safeDeliveryUrl,
} from "@/lib/agencyPortal";

type Change = (
  action: PortalAction,
  data?: Record<string, unknown>,
  revision?: number,
) => Promise<boolean>;
const statusLabels = {
  approved: "Godkänt",
  changes_requested: "Ändringar begärda",
  proposed: "Inväntar beslut",
  declined: "Avböjt",
  withdrawn: "Återkallat",
};
export default function PortalBoard({
  portal: p,
  busy,
  change,
  newLink,
  refresh,
}: {
  portal: AgencyPortal;
  busy: boolean;
  change: Change;
  newLink?: string;
  refresh: () => void;
}) {
  const [copyMessage, setCopyMessage] = useState("");
  const latest = p.deliveries.at(-1);
  const approved = p.extras.filter((item) => item.status === "approved");
  const common = { revision: p.revision, busy: busy || !p.isOpen };
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {p.agencyName} · {p.clientName}
          </p>
          <h1 className="font-display text-2xl font-bold break-words">
            {p.title}
          </h1>
          <p className="mt-1 text-sm">
            {p.isOpen ? "Pågående uppdrag" : "Avslutat uppdrag"} · Uppdaterat{" "}
            {portalDate(p.updatedAt)}
          </p>
          {p.ownerContact && (
            <p className="text-sm whitespace-pre-wrap break-words">
              Kontakt: {p.ownerContact}
            </p>
          )}
        </div>
        <Button variant="outline" disabled={busy} onClick={refresh}>
          Hämta senaste
        </Button>
      </header>
      {!p.isOwner && (
        <p className="rounded-xl bg-muted p-4 text-sm">
          Här samlar ni brief, leveranser och beslut. Kontrollera version och
          omfattning innan du godkänner. Beslut via kundlänk registreras som
          ”Kund via delningslänk”.
        </p>
      )}
      {!p.isOpen && (
        <p role="status" className="rounded-xl border p-4">
          Portalen är avslutad. Leveranser, beslut och historik finns kvar.
        </p>
      )}
      <Tabs defaultValue="deliveries">
        <TabsList className="h-auto flex flex-wrap justify-start gap-1">
          <TabsTrigger value="deliveries">Leveranser</TabsTrigger>
          <TabsTrigger value="brief">Brief</TabsTrigger>
          <TabsTrigger value="extras">Tillägg ({p.extras.length})</TabsTrigger>
          <TabsTrigger value="history">Historik</TabsTrigger>
          {p.isOwner && (
            <TabsTrigger value="sharing">Kundlänk och uppgifter</TabsTrigger>
          )}
        </TabsList>
        <TabsContent
          forceMount
          value="deliveries"
          className="data-[state=inactive]:hidden space-y-5 pt-3"
        >
          {latest ? (
            <section className="rounded-2xl border bg-card p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Aktuell leverans · Version {latest.version}
                  </p>
                  <h2 className="text-xl font-semibold break-words">
                    {latest.title}
                  </h2>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-sm">
                  {latest.decision
                    ? statusLabels[latest.decision.status]
                    : "För granskning"}
                </span>
              </div>
              <p className="whitespace-pre-wrap break-words">
                {latest.description}
              </p>
              {safeDeliveryUrl(latest.url) ? (
                <Button asChild variant="outline">
                  <a
                    href={safeDeliveryUrl(latest.url)!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Öppna leveransversion {latest.version}
                  </a>
                </Button>
              ) : (
                <p role="alert">
                  Leveranslänken är ogiltig. Be byrån lägga upp en ny version.
                </p>
              )}
              <details>
                <summary className="cursor-pointer text-sm font-medium">
                  Brief vid denna leverans
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-sm">
                  {latest.brief || "Ingen brief registrerad vid leveransen."}
                </p>
              </details>
              <div className="space-y-3">
                <h3 className="font-semibold">Samlad återkoppling</h3>
                {latest.feedback.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Ingen återkoppling ännu.
                  </p>
                )}
                {latest.feedback.map((item, index) => (
                  <div
                    key={`${item.at}-${index}`}
                    className="rounded-lg bg-muted/50 p-3"
                  >
                    <p className="text-xs text-muted-foreground">
                      {item.actor} · {portalDate(item.at)}
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
              {latest.decision ? (
                <div className="rounded-lg border p-3">
                  <p className="font-medium">
                    {statusLabels[latest.decision.status]} · version{" "}
                    {latest.version}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {latest.decision.actor} · {portalDate(latest.decision.at)}
                  </p>
                  <p className="whitespace-pre-wrap text-sm">
                    {latest.decision.text}
                  </p>
                </div>
              ) : (
                p.isOpen && (
                  <>
                    <PortalForm
                      key={`feedback-${latest.id}`}
                      {...common}
                      fields={[
                        {
                          name: "text",
                          label: `Återkoppling på version ${latest.version}`,
                          multiline: true,
                        },
                      ]}
                      submitLabel="Lägg till återkoppling"
                      onSubmit={(data, revision) =>
                        change(
                          "feedback",
                          { ...data, version: latest.version },
                          revision,
                        )
                      }
                    />
                    {!p.isOwner && (
                      <div className="grid gap-5 border-t pt-4 md:grid-cols-2">
                        <PortalForm
                          key={`approve-${latest.id}`}
                          {...common}
                          fields={[]}
                          confirmation={`Jag har granskat leveransversion ${latest.version} och godkänner den.`}
                          submitLabel={`Godkänn version ${latest.version}`}
                          onSubmit={(_, revision, confirmed) =>
                            change(
                              "delivery_decision",
                              {
                                version: latest.version,
                                decision: "approved",
                                reviewed: confirmed,
                                text: "",
                              },
                              revision,
                            )
                          }
                        />
                        <PortalForm
                          key={`changes-${latest.id}`}
                          {...common}
                          fields={[
                            {
                              name: "text",
                              label: "Ändringar som behövs",
                              multiline: true,
                            },
                          ]}
                          submitLabel="Begär ändringar"
                          onSubmit={(data, revision) =>
                            change(
                              "delivery_decision",
                              {
                                ...data,
                                version: latest.version,
                                decision: "changes_requested",
                              },
                              revision,
                            )
                          }
                        />
                      </div>
                    )}
                  </>
                )
              )}
            </section>
          ) : (
            <p className="rounded-xl border p-6 text-muted-foreground">
              Ingen leverans upplagd ännu. Börja med att stämma av briefen.
            </p>
          )}
          {p.isOwner && p.isOpen && (
            <details className="rounded-xl border p-4" open={!latest}>
              <summary className="cursor-pointer font-semibold">
                Lägg upp en ny leveransversion
              </summary>
              <div className="pt-4">
                <PortalForm
                  {...common}
                  fields={[
                    { name: "title", label: "Leveransens namn" },
                    {
                      name: "url",
                      label: "Länk till leveransen",
                      type: "url",
                      max: 2000,
                      hint: "Använd en https-länk som kunden kan öppna. Ladda upp en separat fil för varje version så att godkända versioner bevaras.",
                    },
                    {
                      name: "description",
                      label: "Innehåll och vad kunden ska granska",
                      multiline: true,
                    },
                  ]}
                  submitLabel="Lägg upp för granskning"
                  onSubmit={(data, revision) => {
                    if (!safeDeliveryUrl(data.url))
                      throw new Error(
                        "Ange en https-länk utan inloggningsuppgifter i adressen.",
                      );
                    return change("delivery", data, revision);
                  }}
                />
              </div>
            </details>
          )}
          {p.deliveries.length > 1 && (
            <section>
              <h2 className="mb-3 font-semibold">Tidigare versioner</h2>
              {p.deliveries
                .slice(0, -1)
                .reverse()
                .map((item) => (
                  <details key={item.id} className="mb-2 rounded-xl border p-4">
                    <summary className="cursor-pointer font-medium">
                      Version {item.version}: {item.title} ·{" "}
                      {item.decision
                        ? statusLabels[item.decision.status]
                        : "Ersatt av ny version"}
                    </summary>
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="whitespace-pre-wrap">{item.description}</p>
                      {safeDeliveryUrl(item.url) && (
                        <a
                          className="text-primary underline"
                          href={safeDeliveryUrl(item.url)!}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Öppna denna version
                        </a>
                      )}
                      <p className="whitespace-pre-wrap">Brief: {item.brief}</p>
                      {item.feedback.map((feedback, i) => (
                        <p key={i} className="whitespace-pre-wrap">
                          {feedback.actor} ({portalDate(feedback.at)}):{" "}
                          {feedback.text}
                        </p>
                      ))}
                      {item.decision && (
                        <p className="whitespace-pre-wrap">
                          {item.decision.actor} · {portalDate(item.decision.at)}
                          :{" "}
                          {item.decision.text ||
                            statusLabels[item.decision.status]}
                        </p>
                      )}
                    </div>
                  </details>
                ))}
            </section>
          )}
        </TabsContent>
        <TabsContent
          forceMount
          value="brief"
          className="data-[state=inactive]:hidden space-y-3 pt-3"
        >
          <h2 className="text-xl font-semibold">Gemensam brief</h2>
          <p className="text-sm text-muted-foreground">
            Beskriv mål, målgrupp, innehåll och avgränsningar. Varje leverans
            sparar en kopia av briefen som gällde då.
          </p>
          <PortalForm
            {...common}
            keepValues
            fields={[
              {
                name: "brief",
                label: "Överenskommen brief",
                value: p.brief,
                multiline: true,
                max: 10000,
              },
            ]}
            submitLabel="Spara brief"
            onSubmit={(data, revision) => change("brief", data, revision)}
          />
        </TabsContent>
        <TabsContent
          forceMount
          value="extras"
          className="data-[state=inactive]:hidden space-y-4 pt-3"
        >
          <h2 className="text-xl font-semibold">Tilläggsarbeten</h2>
          <p className="text-sm text-muted-foreground">
            Varje tillägg har ett fast totalpris exklusive moms. Kunden granskar
            omfattning och pris före godkännande.
          </p>
          {p.extras.length === 0 && (
            <p className="rounded-xl border p-4 text-muted-foreground">
              Inga tillägg föreslagna.
            </p>
          )}
          {p.extras.map((item) => (
            <article key={item.id} className="rounded-xl border p-4 space-y-3">
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-semibold break-words">{item.title}</h3>
                <span className="text-sm">{statusLabels[item.status]}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{item.description}</p>
              <p className="font-bold">
                {portalMoney(item.priceOre)} exkl. moms
              </p>
              {item.decision && (
                <p className="text-sm whitespace-pre-wrap">
                  {item.decision.actor} · {portalDate(item.decision.at)}
                  {item.decision.text && ` · ${item.decision.text}`}
                </p>
              )}
              {item.status === "proposed" &&
                p.isOpen &&
                (p.isOwner ? (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      void change("withdraw_extra", { id: item.id })
                    }
                  >
                    Återkalla förslaget
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <PortalForm
                      {...common}
                      fields={[]}
                      confirmation={`Jag godkänner omfattningen ovan och totalpriset ${portalMoney(item.priceOre)} exklusive moms.`}
                      submitLabel="Godkänn tillägg och pris"
                      onSubmit={(_, revision, confirmed) =>
                        change(
                          "extra_decision",
                          {
                            id: item.id,
                            decision: "approved",
                            confirmPrice: confirmed,
                          },
                          revision,
                        )
                      }
                    />
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        void change("extra_decision", {
                          id: item.id,
                          decision: "declined",
                        })
                      }
                    >
                      Avböj tillägget
                    </Button>
                  </div>
                ))}
            </article>
          ))}
          {p.isOwner && (
            <>
              <div className="rounded-xl bg-muted p-4">
                <p className="font-semibold">
                  Godkända tillägg:{" "}
                  {portalMoney(
                    approved.reduce((sum, item) => sum + item.priceOre, 0),
                  )}{" "}
                  exkl. moms
                </p>
                <p className="my-2 text-sm">
                  Underlaget innehåller godkända tillägg. Kontrollera utfört
                  arbete och tidigare fakturering innan du skapar fakturan.
                </p>
                <Button
                  variant="outline"
                  disabled={approved.length === 0}
                  onClick={() => {
                    const url = URL.createObjectURL(
                      new Blob([invoiceBasis(p)], {
                        type: "text/plain;charset=utf-8",
                      }),
                    );
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `tillagg-${p.id}.txt`;
                    a.click();
                    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }}
                >
                  Hämta fakturaunderlag
                </Button>
              </div>
              {p.isOpen && (
                <details className="rounded-xl border p-4">
                  <summary className="cursor-pointer font-semibold">
                    Föreslå ett tillägg
                  </summary>
                  <div className="pt-4">
                    <PortalForm
                      {...common}
                      fields={[
                        { name: "title", label: "Tilläggets namn" },
                        {
                          name: "description",
                          label: "Omfattning, leverans och villkor",
                          multiline: true,
                        },
                        {
                          name: "price",
                          label: "Fast totalpris i kronor exklusive moms",
                          hint: "Exempel: 2500 eller 2500,50. Priset låses när förslaget sparas.",
                        },
                      ]}
                      submitLabel="Lägg till prisförslag"
                      onSubmit={(data, revision) =>
                        change(
                          "extra",
                          {
                            title: data.title,
                            description: data.description,
                            priceOre: priceToOre(data.price),
                          },
                          revision,
                        )
                      }
                    />
                  </div>
                </details>
              )}
            </>
          )}
        </TabsContent>
        <TabsContent
          forceMount
          value="history"
          className="data-[state=inactive]:hidden pt-3"
        >
          <h2 className="mb-4 text-xl font-semibold">Beslut och historik</h2>
          <ol className="space-y-3">
            {[...p.history].reverse().map((item, index) => (
              <li key={`${item.at}-${index}`} className="border-l-2 pl-4">
                <p className="text-xs text-muted-foreground">
                  {portalDate(item.at)} · {item.actor}
                </p>
                <p className="text-sm">{item.text}</p>
              </li>
            ))}
          </ol>
        </TabsContent>
        {p.isOwner && (
          <TabsContent
            forceMount
            value="sharing"
            className="data-[state=inactive]:hidden space-y-5 pt-3"
          >
            <section className="rounded-xl border p-4 space-y-3">
              <h2 className="font-semibold">Kundens länk</h2>
              <p className="text-sm">
                Den som har länken kan läsa uppdraget, lämna återkoppling och
                fatta kundbeslut. Dela den direkt med rätt beställare. En ny
                länk spärrar den tidigare och gäller i 90 dagar.
              </p>
              <p className="text-sm">
                {p.linkExpiresAt
                  ? `Aktuell länk giltig till ${portalDate(p.linkExpiresAt)}`
                  : "Ingen aktiv kundlänk."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={busy || !p.isOpen}
                  onClick={() => {
                    setCopyMessage("");
                    void change("create_link");
                  }}
                >
                  {p.linkExpiresAt
                    ? "Ersätt med ny kundlänk"
                    : "Skapa kundlänk"}
                </Button>
                {p.linkExpiresAt && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => void change("revoke_link")}
                  >
                    Spärra kundlänken
                  </Button>
                )}
              </div>
              {newLink && p.linkExpiresAt && (
                <div className="space-y-2">
                  <label htmlFor="portal-link" className="text-sm font-medium">
                    Kopiera länken nu – den visas bara denna gång
                  </label>
                  <input
                    id="portal-link"
                    readOnly
                    value={newLink}
                    onFocus={(event) => event.target.select()}
                    className="w-full rounded-md border bg-background p-2 text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(newLink);
                        setCopyMessage("Länken är kopierad.");
                      } catch {
                        setCopyMessage(
                          "Markera och kopiera länken i fältet ovan.",
                        );
                      }
                    }}
                  >
                    Kopiera kundlänk
                  </Button>
                  <p role="status" className="text-sm">
                    {copyMessage}
                  </p>
                </div>
              )}
            </section>
            <section className="rounded-xl border p-4 space-y-3">
              <h2 className="font-semibold">Uppdragsuppgifter</h2>
              <PortalForm
                {...common}
                keepValues
                fields={[
                  { name: "title", label: "Uppdragets namn", value: p.title },
                  {
                    name: "clientName",
                    label: "Kundens namn",
                    value: p.clientName,
                  },
                  {
                    name: "clientContact",
                    label: "Kundkontakt, synlig för byrån",
                    value: p.clientContact || "",
                    optional: true,
                    max: 300,
                  },
                  {
                    name: "ownerContact",
                    label: "Byråkontakt, synlig för kunden",
                    value: p.ownerContact,
                    optional: true,
                    max: 300,
                  },
                ]}
                submitLabel="Spara uppgifter"
                onSubmit={(data, revision) => change("details", data, revision)}
              />
            </section>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void change(p.isOpen ? "close" : "reopen")}
            >
              {p.isOpen
                ? "Avsluta portalen och behåll historiken"
                : "Öppna portalen igen"}
            </Button>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
