import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import PortalForm from "@/components/portal/PortalForm";
import PortalWorkspace from "@/components/portal/PortalWorkspace";
import {
  createPortal,
  listPortals,
  portalDate,
  type PortalSummary,
} from "@/lib/agencyPortal";

export default function SupplierPortals() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const id = params.get("id");
  const [portals, setPortals] = useState<PortalSummary[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const creationId = useRef<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPortals(await listPortals());
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Portalerna kunde inte hämtas.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    setPortals([]);
    if (user && !id) void load();
  }, [load, user, id]);
  if (id)
    return (
      <div className="max-w-5xl space-y-5">
        <Button variant="outline" onClick={() => setParams({})}>
          Alla kundportaler
        </Button>
        <PortalWorkspace key={id} id={id} />
      </div>
    );
  return (
    <div className="max-w-5xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Kundportaler</h1>
        <p className="mt-2 text-muted-foreground">
          Samla brief, leveranser och godkända tillägg för dina egna kunder och
          uppdrag via Updro.
        </p>
      </header>
      <details className="rounded-2xl border bg-card p-5">
        <summary className="cursor-pointer font-semibold">
          Ny portal för en egen kund
        </summary>
        <div className="pt-4">
          <PortalForm
            revision={0}
            busy={busy}
            fields={[
              { name: "title", label: "Uppdragets namn" },
              { name: "clientName", label: "Kundens namn" },
              {
                name: "clientContact",
                label: "Kundkontakt, endast för byrån",
                optional: true,
                max: 300,
              },
              {
                name: "ownerContact",
                label: "Byråkontakt, synlig för kunden",
                optional: true,
                max: 300,
              },
              {
                name: "brief",
                label: "Inledande brief",
                optional: true,
                multiline: true,
                max: 10000,
              },
            ]}
            submitLabel="Skapa kundportal"
            onSubmit={async (data) => {
              setBusy(true);
              try {
                creationId.current ??= crypto.randomUUID();
                const portal = await createPortal(creationId.current, data);
                creationId.current = null;
                setParams({ id: portal.id });
                return true;
              } finally {
                setBusy(false);
              }
            }}
          />
        </div>
      </details>
      <p className="text-sm text-muted-foreground">
        För ett accepterat Updro-uppdrag kan du också öppna portalen direkt från{" "}
        <Link
          className="underline text-primary"
          to="/dashboard/supplier/offerter"
        >
          Mina offerter
        </Link>
        .
      </p>
      {loading ? (
        <p role="status">Hämtar kundportaler…</p>
      ) : error ? (
        <div role="alert">
          <p>{error}</p>
          <Button variant="outline" onClick={() => void load()}>
            Försök igen
          </Button>
        </div>
      ) : portals.length === 0 ? (
        <p className="rounded-xl border p-6 text-muted-foreground">
          Du har inga kundportaler ännu. Skapa den första ovan när du har ett
          uppdrag att samla här.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {portals.map((portal) => (
            <Link
              key={portal.id}
              to={`?id=${portal.id}`}
              className="rounded-2xl border bg-card p-5 transition-colors hover:border-primary"
            >
              <p className="text-xs text-muted-foreground">
                {portal.isOpen ? "Pågående" : "Avslutad"} · {portal.clientName}
              </p>
              <h2 className="mt-2 font-semibold break-words">{portal.title}</h2>
              <p className="mt-3 text-xs text-muted-foreground">
                Uppdaterad {portalDate(portal.updatedAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
