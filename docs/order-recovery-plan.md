# Order processing: implementation and checks

Starting point: Talha49/DineThread, commit d366111. This work implements Aby's signed specification for order submission, duplicate prevention and lost-confirmation recovery. The signed specification remains unchanged.

## Boundaries

- Fahad owns menu consistency and quotation rules. The order service will call a shared menu-validation/pricing function; this change preserves the current pricing policy.
- Ali owns later kitchen transitions and billing. Customer reads and bill requests will gain session ownership checks, without changing the kitchen state machine.
- This branch includes software, diagnostic checks and the controlled experiment harness. Measured results are kept separately from pilots, and final-report interpretation remains a later step.

## Cart motion and browser checks

The existing Framer Motion dependency owns drawer and cart-button transforms/opacity. CSS retains focus and colour feedback. No new animation library is needed. Reduced-motion users get immediate drawer transitions. Native scrolling stays unchanged.

Check normal submission, repeated requests, a dropped confirmation after database commit, reload with an unresolved purchase, changed content with a reused identifier, an independent identical purchase, and a different browser session. Inspect the cart and recovery state at desktop and mobile widths, including keyboard operation and reduced motion. Capture screenshots and record any limits of the checks.

## Implementation sequence

1. Add canonical request fingerprints, anonymous browser ownership and database-enforced request uniqueness.
2. Preserve the accepted order ID and total on retry, including after menu edits. Return a conflict for changed content.
3. Keep an unresolved purchase separately from the editable cart. The phone must establish its session before sending an order.
4. Run unit, database and browser checks against synthetic local data. Keep the default production path in recovery mode; use the baseline only for isolated comparison runs.

## Experiment protocol and evidence

The signed specification is mapped to the implementation and repeatable experiment harness in `research/order-recovery/README.md`. Pilot runs precede the frozen protocol; measured evidence is recorded separately. Development-test counts are not substitutes for the paired experiments.

## Pending-purchase resolution

A rejected or cancelled purchase leaves a terminal receipt under the same database uniqueness constraint as an accepted order. A delayed copy cannot execute after that receipt wins. If acceptance wins first, cancellation returns the original confirmation; it never claims to cancel an accepted kitchen order. A changed-payload conflict preserves the unresolved original snapshot.

A separate local purchase journal survives edits to the cart. A Web Lock coordinates submissions and session creation across tabs. Other tabs observe the journal's result. Unsupported browsers fail before submission and direct the customer to staff. Storage/session loss is not evidence that the purchase failed.

## Running the development checks

Use `npm ci`, then `npm test -- --runInBand`. The database tests start a disposable MongoDB 8.0.17 instance and seed synthetic records. The first Windows binary download is large and needs network access. The tests do not read a deployment database URI.

For browser checks, build the app with a disposable `AUTH_SECRET` and a local-only `MONGODB_URI`, then run `node scripts/order-browser-check.js`. Install Playwright's Chromium first, or set `QA_CHROME_PATH` to an installed Chrome executable. The script starts its own local MongoDB and app on port 3038, uses desktop and phone viewports, and writes screenshots and JSON under the ignored `qa-results` directory. It deliberately drops a response after a real insert and checks recovery after a reload and menu change.

`ORDER_SUBMISSION_MODE=baseline` selects the comparison implementation; leave it unset for recovery. Use a fresh browser context and an isolated database when switching implementations. Do not change modes while customers have pending orders. The baseline permits duplicates by design and is for research runs only.

## Before a live rollout

- Drain active orders made before browser ownership was introduced. Staff can still see and finish these records; customer routes intentionally deny new sessions access. Do not assign ownership from possession of an old order ID. Tests cover this boundary. Deploy only after staff confirm the old active queue is settled; no production database was changed during this work.
- Existing pending snapshots from the first recovery patch are imported into the new journal under the browser lock. Keep the same cookie and origin during the upgrade. Missing/expired cookies require staff resolution, not a new session claiming an old order.
- Preserve public `Host` and HTTPS at the deployment proxy. The Web Locks API needs a secure context (localhost is used for tests).
- Keep acceptance/rejection/cancellation receipts for the study and beyond the supported retry horizon. Expiry and multi-service payment/inventory guarantees are outside this specification.
- The local experiments cannot certify the deployed environment. Repeat a staging smoke test after integrating the other members' changes, including the shared pricing interface and initial kitchen record.

## Implementation references and provenance

The change extends the group's existing cart, pricing and Order model. Implementation and development tests were prepared with Codex assistance; the group must review and understand the changes before using their results in the report.

## References

The database safeguard uses MongoDB's [unique compound index](https://www.mongodb.com/docs/manual/core/index-unique/) behaviour. Local test setup follows the [mongodb-memory-server test-runner guidance](https://typegoose.github.io/mongodb-memory-server/docs/guides/integration-examples/test-runners/). These references describe mechanisms and tooling; they are not evidence that the project's experiments have been completed.
