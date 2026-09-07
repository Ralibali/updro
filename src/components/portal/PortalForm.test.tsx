import {
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PortalForm from "./PortalForm";
afterEach(cleanup);
const fields = [
  { name: "brief", label: "Brief", value: "Original brief", multiline: true },
];
describe("portal drafts", () => {
  it("retains input and original revision after a failed save and a refresh", async () => {
    const submit = vi.fn().mockResolvedValue(false);
    const view = render(
      <PortalForm
        fields={fields}
        submitLabel="Spara"
        revision={1}
        busy={false}
        onSubmit={submit}
      />,
    );
    fireEvent.change(screen.getByLabelText("Brief"), {
      target: { value: "My unsaved brief" },
    });
    fireEvent.click(screen.getByText("Spara"));
    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith(
        { brief: "My unsaved brief" },
        1,
        false,
      ),
    );
    view.rerender(
      <PortalForm
        fields={[{ ...fields[0], value: "Remote edit" }]}
        submitLabel="Spara"
        revision={2}
        busy={false}
        onSubmit={submit}
      />,
    );
    expect(screen.getByLabelText("Brief")).toHaveValue("My unsaved brief");
    fireEvent.click(screen.getByText("Spara"));
    await waitFor(() =>
      expect(submit).toHaveBeenLastCalledWith(
        { brief: "My unsaved brief" },
        1,
        false,
      ),
    );
    fireEvent.click(
      screen.getByText("Jag har granskat uppgifterna – använd mitt utkast"),
    );
    fireEvent.click(screen.getByText("Spara"));
    await waitFor(() =>
      expect(submit).toHaveBeenLastCalledWith(
        { brief: "My unsaved brief" },
        2,
        false,
      ),
    );
  });
  it("blocks duplicate submits while a request is in flight", async () => {
    let finish!: (result: boolean) => void;
    const submit = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          finish = resolve;
        }),
    );
    render(
      <PortalForm
        fields={fields}
        submitLabel="Spara"
        revision={1}
        busy={false}
        onSubmit={submit}
      />,
    );
    fireEvent.click(screen.getByText("Spara"));
    fireEvent.click(screen.getByText("Spara"));
    expect(submit).toHaveBeenCalledTimes(1);
    finish(true);
    await waitFor(() =>
      expect(screen.getByLabelText("Brief")).toHaveValue("Original brief"),
    );
  });
});
