import { useLocation } from "react-router-dom";
import PortalWorkspace from "@/components/portal/PortalWorkspace";
export default function ClientPortal() {
  const location = useLocation();
  const token =
    new URLSearchParams(location.hash.slice(1)).get("token") || undefined;
  const id = new URLSearchParams(location.search).get("id");
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 text-sm font-semibold text-primary">
          Kundportal · Updro
        </p>
        {token || id ? (
          <PortalWorkspace
            key={`${id || ""}-${token || ""}`}
            id={id}
            token={token}
          />
        ) : (
          <div className="rounded-2xl border p-6">
            <h1 className="text-2xl font-semibold">Öppna din kundportal</h1>
            <p className="mt-3 text-muted-foreground">
              Använd hela länken som din byrå har delat med dig. Kontakta byrån
              om du saknar den eller behöver en ny länk.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
