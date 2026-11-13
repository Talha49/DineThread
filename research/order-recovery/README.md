# Aby: order-recovery protocol and evidence

This folder records the implementation and controlled experiments for Aby's signed specification. It is research evidence, not a dissertation draft. The signed specification has not been edited.

## Comparison

A is a deliberately non-idempotent comparison mode: the button blocks repeated clicks while sending, but a later valid retry creates a new order. It has no persistent unconfirmed-purchase snapshot. B retains a purchase identifier and original payload, enforces a unique restaurant/identifier index, and replays the accepted ID and total. These modes share menu validation/pricing, anonymous browser ownership, read access, instrumentation, dependencies and test fixtures. A is the group-code starting behaviour with those shared controls; it is not an untouched checkout of the original commit.

The comparison evaluates the combined design, not the separate causal effect of each safeguard. It is not a comparison of production systems or an estimate of restaurant demand.

## Protocol

`protocol.json` is frozen only after pilot checks. Pilot and warm-up data are excluded. The measured API workload uses 20 matched pairs of batches, 20 intended purchases per batch, for each of seven conditions. The same deterministic workload and fixture values are saved before testing either mode. The order of A/B alternates across conditions and batches. Browser evaluation uses five paired trials each for lost confirmation, reload and application restart, alternating mode order and using three mobile and two desktop trials per condition. The optional ten-copy extension is omitted.

An independent oracle states the intended purchases and expected totals. Test-only server traces associate attempts with results; their labels never influence acceptance or deduplication. The proxy verifies the stored order before dropping an API confirmation. Browser fault injection fetches the real response, checks the inserted record, then aborts delivery. Concurrency is checked from server start/end events, as well as a development test that gates actual overlapping database inserts.

A duplicate is more than one accepted order for an intended purchase. An extra order is each stored copy beyond the first. A lost purchase has no accepted order by the observation deadline. A merge maps distinct intended purchases to one order. Rejected/cancelled receipts are not orders. Recovery needs the original ID and total within the fixed deadline and exactly one accepted order. Failed attempts remain in the raw records; expected validation rejections are not lost purchases. Application restarts preserve MongoDB and the browser context. The observation and recovery deadlines are in the protocol.

API latency runs from sending the request to reading the complete response. Creation and replay timings are reported separately. Browser recovery time includes the retry interaction and rendering the confirmation, starting at the first permitted retry. After reload/restart, the page is ready before this timer starts. It therefore measures confirmation recovery, not whole-server boot time.

## Reproduce

1. `npm ci` and `npm test -- --runInBand`.
2. Build with a disposable `AUTH_SECRET` and a local-only `MONGODB_URI`. These values are not production credentials.
3. Set `QA_CHROME_PATH` to an installed Chrome executable, or install the matching Playwright Chromium.
4. Run `node scripts/order-api-experiment.js --pilot` and `node scripts/order-browser-experiment.js --pilot`.
5. Review the pilot and freeze the protocol before measured runs. Record any later changes and retain failures.
6. Run `node scripts/order-api-experiment.js`, then `node scripts/order-browser-experiment.js`. Do not overlap measured runs with other test/build jobs.

Each harness creates isolated MongoDB databases and local apps on ports 3041-3044. It does not take a deployment database URI. It writes timestamped evidence directories under `qa-results`, closes its own processes and removes its temporary databases on exit. Raw JSONL files record attempts, server events, fault injection and database observations. Failed runs are retained alongside successful ones.

## Remaining group work

Aby's boundary is purchase identity, submission and confirmation recovery. `priceNewOrder` is the current integration seam for Fahad's menu rules. The staff queue receives only accepted orders; later workflow transitions are Ali's area. Accessibility evaluation beyond the recovery controls remains Bibek's area; theme/dashboard evaluation remains Talha's. Integrate and rerun the relevant regression checks when those components change. Individual reflection, literature synthesis and final-report writing still require the student's work.

## Mechanism notes and sources

[MongoDB unique indexes](https://www.mongodb.com/docs/manual/core/index-unique/) underpin the competing acceptance/rejection/cancellation inserts. A terminal receipt shares the order's unique key, so a delayed request cannot execute after a confirmed cancellation. Accepted results remain in one document. Receipts are retained; expiry is outside this specification's scope.

The browser uses the [Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API) to coordinate tabs and first-session creation. Its durable purchase journal is separate from editable cart storage. An unsupported/insecure browser fails before ordering, with a staff-help message. See `docs/order-recovery-plan.md` for rollout boundaries.

The group code is the starting implementation. Codex assisted with this implementation, test harness and evidence processing; the student should understand and explain the mechanisms, controls and limitations. No results are inferred from a passing demonstration alone.
