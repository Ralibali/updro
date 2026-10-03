# Supplier Sales OS — 2026-10-03

## Goal

Give agencies a lightweight sales workspace around the Updro offers they already manage, without introducing a separate CRM or exposing internal notes to buyers.

## Product changes

- `Mina offerter` gets commercial KPIs:
  - pending offer value,
  - accepted/won value,
  - follow-ups due,
  - active offers missing a next step.
- Every active offer can store:
  - next action,
  - follow-up date/time,
  - private internal note.
- Due follow-ups are visibly flagged on the offer card.

## Privacy model

Buyer users can read submitted offer rows, so private sales metadata is deliberately **not** stored on `offers`.

`supplier_offer_followups` is a separate RLS-protected table. Policies require both:
1. `supplier_id = auth.uid()`, and
2. the referenced offer belongs to the same supplier.

No buyer read policy exists.

## Deployment order

1. Apply `20261003141500_supplier_sales_pipeline.sql`.
2. Publish the frontend.
3. Sign in as a supplier with an existing offer.
4. Save a next action and private note, reload, and verify persistence.
5. Verify a buyer session cannot select rows from `supplier_offer_followups`.

This is additive and does not alter the buyer-visible offer contract.
