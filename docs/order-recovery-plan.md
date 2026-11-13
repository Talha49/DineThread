# Order processing: implementation and checks

Starting point: Talha49/DineThread, commit d366111. This work implements Aby's signed specification for order submission, duplicate prevention and lost-confirmation recovery. The signed specification remains unchanged.

## Boundaries

- Fahad owns menu consistency and quotation rules. The order service will call a shared menu-validation/pricing function; this change preserves the current pricing policy.
- Ali owns later kitchen transitions and billing. Customer reads and bill requests will gain session ownership checks, without changing the kitchen state machine.
- This branch adds software and diagnostic tests. The paired experiments, measurements and report analysis described in the specification are separate work.

## Cart motion and browser checks

The existing Framer Motion dependency owns drawer and cart-button transforms/opacity. CSS retains focus and colour feedback. No new animation library is needed. Reduced-motion users get immediate drawer transitions. Native scrolling stays unchanged.

Check normal submission, repeated requests, a dropped confirmation after database commit, reload with an unresolved purchase, changed content with a reused identifier, an independent identical purchase, and a different browser session. Inspect the cart and recovery state at desktop and mobile widths, including keyboard operation and reduced motion. Capture screenshots and record any limits of the checks.

## Implementation sequence

1. Add canonical request fingerprints, anonymous browser ownership and database-enforced request uniqueness.
2. Preserve the accepted order ID and total on retry, including after menu edits. Return a conflict for changed content.
3. Keep an unresolved purchase separately from the editable cart. The phone must establish its session before sending an order.
4. Run unit, database and browser checks against synthetic local data. Keep the default production path in recovery mode; use the baseline only for isolated comparison runs.

## Research still to perform

Pilot the workload and freeze time limits before measured runs. Then run the signed specification's matched baseline/recovery batches and browser trials. Record independent expected purchases, accepted IDs/totals, duplicate/lost/merged outcomes, creation/replay latency, and recovery time. Do not treat passing development tests as completed dissertation experiments.

## Running the development checks

Use `npm ci`, then `npm test -- --runInBand`. The database tests start a disposable MongoDB 8.0.17 instance and seed synthetic records. The first Windows binary download is large and needs network access. The tests do not read a deployment database URI.

For browser checks, build the app with a disposable `AUTH_SECRET` and a local-only `MONGODB_URI`, then run `node scripts/order-browser-check.js`. Install Playwright's Chromium first, or set `QA_CHROME_PATH` to an installed Chrome executable. The script starts its own local MongoDB and app on port 3038, uses desktop and phone viewports, and writes screenshots and JSON under the ignored `qa-results` directory. It deliberately drops a response after a real insert and checks recovery after a reload and menu change.

`ORDER_SUBMISSION_MODE=baseline` selects the comparison implementation; leave it unset for recovery. Use a fresh browser context and an isolated database when switching implementations. Do not change modes while customers have pending orders. The baseline permits duplicates by design and is for research runs only.

## Before a live rollout

- Orders created before this change have no browser owner. Customer routes now deny access to those old records; agree a transition with staff before deploying to a database containing active orders.
- The interface retains uncertain or rejected submissions and directs the customer to staff. A safe cancellation/rejection-resolution workflow still needs design; simply deleting a pending identifier could create another order when an earlier request is still in flight.
- Coordinate simultaneous tabs before treating them as one shared purchase. The server handles repeated identifiers, but independent tabs can still create independent purchase identifiers.
- Check the deployment proxy preserves the public `Host` header and uses HTTPS. A missing or expired browser cookie prevents customer recovery; it must not grant a new session access to an old order.
- Complete the signed specification's app-restart trials and paired measurements. Development checks establish behaviour in the tested cases, not commercial performance or completion of the research.

## Implementation references and provenance

The change extends the group's existing cart, pricing and Order model. Implementation and development tests were prepared with Codex assistance; the group must review and understand the changes before using their results in the report.

## References

The database safeguard uses MongoDB's [unique compound index](https://www.mongodb.com/docs/manual/core/index-unique/) behaviour. Local test setup follows the [mongodb-memory-server test-runner guidance](https://typegoose.github.io/mongodb-memory-server/docs/guides/integration-examples/test-runners/). These references describe mechanisms and tooling; they are not evidence that the project's experiments have been completed.
