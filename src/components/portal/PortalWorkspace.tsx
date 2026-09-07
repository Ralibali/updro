import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  changePortal,
  getPortal,
  type AgencyPortal,
  type PortalAction,
} from "@/lib/agencyPortal";
import PortalBoard from "./PortalBoard";
import { Button } from "@/components/ui/button";

export default function PortalWorkspace({
  id,
  token,
}: {
  id: string | null;
  token?: string;
}) {
  const { user, loading: authLoading } = useAuth();
  const [portal, setPortal] = useState<AgencyPortal | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [newLink, setNewLink] = useState("");
  const lock = useRef(false);
  const generation = useRef(0);
  const load = useCallback(
    async (clear = false) => {
      const request = ++generation.current;
      if (clear) {
        setPortal(null);
        setNewLink("");
      }
      setLoading(true);
      setError("");
      try {
        const next = await getPortal(id, token);
        if (request === generation.current) setPortal(next);
      } catch (cause) {
        if (request === generation.current)
          setError(
            cause instanceof Error
              ? cause.message
              : "Portalen kunde inte hämtas.",
          );
      } finally {
        if (request === generation.current) setLoading(false);
      }
    },
    [id, token],
  );
  const invalidate = useCallback(() => {
    generation.current++;
  }, []);
  useEffect(() => {
    if (!authLoading) void load(true);
    return invalidate;
  }, [load, user?.id, authLoading, invalidate]);
  const change = async (
    action: PortalAction,
    data: Record<string, unknown> = {},
    revision = portal?.revision,
  ): Promise<boolean> => {
    if (!portal || lock.current || revision === undefined) return false;
    lock.current = true;
    setBusy(true);
    setError("");
    const request = generation.current;
    try {
      const next = await changePortal(portal.id, revision, action, data, token);
      if (request !== generation.current) return false;
      setPortal(next);
      if (next.newLinkToken)
        setNewLink(
          `${window.location.origin}/kundportal#token=${encodeURIComponent(next.newLinkToken)}`,
        );
      else if (action === "revoke_link") setNewLink("");
      return true;
    } catch (cause) {
      if (request === generation.current)
        setError(
          cause instanceof Error
            ? cause.message
            : "Kunde inte spara. Ditt utkast finns kvar.",
        );
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/5 p-4"
        >
          <p>{error}</p>
          <p className="mt-1 text-sm">
            Vid en versionskonflikt: hämta senaste uppgifterna och granska dem
            innan du skickar ditt utkast igen.
          </p>
          {!portal && (
            <Button
              className="mt-3"
              variant="outline"
              onClick={() => void load()}
            >
              Försök igen
            </Button>
          )}
        </div>
      )}
      {(loading || authLoading) && (
        <p role="status" className="text-sm text-muted-foreground">
          Hämtar kundportal…
        </p>
      )}
      {portal && (
        <PortalBoard
          portal={portal}
          busy={busy || loading || authLoading}
          change={change}
          newLink={newLink}
          refresh={() => void load()}
        />
      )}
    </div>
  );
}
