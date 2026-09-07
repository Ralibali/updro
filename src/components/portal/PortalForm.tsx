import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type PortalField = {
  name: string;
  label: string;
  value?: string;
  max?: number;
  multiline?: boolean;
  optional?: boolean;
  type?: "text" | "url";
  hint?: string;
};
export default function PortalForm({
  fields,
  submitLabel,
  revision,
  busy,
  onSubmit,
  confirmation,
  keepValues = false,
}: {
  fields: PortalField[];
  submitLabel: string;
  revision: number;
  busy: boolean;
  confirmation?: string;
  keepValues?: boolean;
  onSubmit: (
    data: Record<string, string>,
    revision: number,
    confirmed: boolean,
  ) => Promise<boolean>;
}) {
  const prefix = useId();
  const form = useRef<HTMLFormElement>(null);
  const draftRevision = useRef<number | null>(null);
  const submitting = useRef(false);
  const [error, setError] = useState("");
  const [, render] = useState(0);
  useEffect(() => {
    if (draftRevision.current === null) form.current?.reset();
  }, [revision]);
  return (
    <form
      ref={form}
      className="space-y-3"
      onChange={() => {
        draftRevision.current ??= revision;
      }}
      onSubmit={async (event) => {
        event.preventDefault();
        if (submitting.current || busy) return;
        submitting.current = true;
        setError("");
        const raw = new FormData(event.currentTarget);
        const data = Object.fromEntries(
          fields.map((field) => [
            field.name,
            String(raw.get(field.name) || "").trim(),
          ]),
        );
        try {
          if (
            await onSubmit(
              data,
              draftRevision.current ?? revision,
              raw.get("confirmed") === "on",
            )
          ) {
            draftRevision.current = null;
            if (!keepValues) form.current?.reset();
          }
        } catch (cause) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Kunde inte spara. Dina uppgifter finns kvar.",
          );
        } finally {
          submitting.current = false;
        }
      }}
    >
      <fieldset disabled={busy} className="space-y-3">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <label
              className="block text-sm font-medium"
              htmlFor={`${prefix}-${field.name}`}
            >
              {field.label}
              {field.optional ? " (valfritt)" : ""}
            </label>
            {field.multiline ? (
              <Textarea
                id={`${prefix}-${field.name}`}
                name={field.name}
                defaultValue={field.value || ""}
                required={!field.optional}
                maxLength={field.max || 5000}
                rows={4}
              />
            ) : (
              <Input
                id={`${prefix}-${field.name}`}
                name={field.name}
                type={field.type || "text"}
                defaultValue={field.value || ""}
                required={!field.optional}
                maxLength={field.max || 200}
              />
            )}
            {field.hint && (
              <p className="text-xs text-muted-foreground">{field.hint}</p>
            )}
          </div>
        ))}
        {confirmation && (
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="confirmed" required className="mt-1" />
            {confirmation}
          </label>
        )}
        {draftRevision.current !== null &&
          draftRevision.current !== revision && (
            <div className="rounded-lg border p-3 text-sm">
              <p>
                Portalen har en ny version. Ditt utkast finns kvar. Granska de
                senaste uppgifterna innan du använder det.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-2 whitespace-normal h-auto"
                onClick={() => {
                  draftRevision.current = revision;
                  render((value) => value + 1);
                }}
              >
                Jag har granskat uppgifterna – använd mitt utkast
              </Button>
            </div>
          )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit">{busy ? "Sparar…" : submitLabel}</Button>
      </fieldset>
    </form>
  );
}
