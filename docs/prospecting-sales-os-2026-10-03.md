# Updro Evidence Engine + Sales OS — 2026-10-03

## Scope

This release turns the existing admin prospecting flow into an actionable commercial workspace without introducing another CRM or another crawler dependency.

The Firecrawl prospecting function already stores deterministic `company_intelligence` for each result. The admin UI previously did not expose it. This release surfaces that evidence and adds a lightweight follow-up layer on the same lead rows.

## Added

- Evidence panel per prospect with confidence, summary, technology, commercial, growth and risk signals, plus the underlying evidence list.
- Pipeline overview for the selected campaign: total leads, strong evidence, overdue follow-ups and open estimated pipeline value.
- Follow-up fields: next action, date/time and optional estimated deal value in SEK.
- Follow-up filter for overdue, scheduled and missing next actions.
- Pure helper tests for evidence normalization, due dates and pipeline metrics.

## Guardrails

- Existing lead statuses remain the pipeline stages. No competing CRM schema is introduced.
- No email is sent automatically. Existing human approval before outreach/export remains unchanged.
- Evidence is based on public company-site signals already collected by the existing Firecrawl flow. Weak evidence stays explicit rather than being converted into invented needs.
- No new runtime dependency or third-party license is added.

## Database

Apply `20261003134800_prospecting_sales_os.sql` after the existing prospecting migrations. It is additive: three nullable columns and one partial index.

The existing prospecting tables are already admin-restricted by RLS; this migration does not widen grants or add public access.

## Deployment

1. Apply the migration.
2. Publish the frontend.
3. Verify with an admin account:
   - open an existing Firecrawl campaign and confirm evidence renders;
   - save a next action, follow-up time and deal value;
   - reload and confirm values persist;
   - filter overdue follow-ups;
   - approve/export one existing reviewed pitch and confirm the existing human-approval flow is unchanged.

Rollback can restore the frontend independently. The additive columns can remain in place even if the UI is rolled back.
