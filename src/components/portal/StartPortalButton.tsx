import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createPortal } from "@/lib/agencyPortal";
export default function StartPortalButton({ offerId }: { offerId: string }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef<string | null>(null);
  const lock = useRef(false);
  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={async () => {
          if (lock.current) return;
          lock.current = true;
          setBusy(true);
          setError("");
          try {
            requestId.current ??= crypto.randomUUID();
            const portal = await createPortal(requestId.current, {}, offerId);
            navigate(`/dashboard/supplier/kundportal?id=${portal.id}`);
          } catch (cause) {
            setError(
              cause instanceof Error
                ? cause.message
                : "Portalen kunde inte öppnas.",
            );
          } finally {
            lock.current = false;
            setBusy(false);
          }
        }}
      >
        {busy ? "Öppnar…" : "Öppna kundportal"}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
