# Aby: order-processing results and completion record

Measured implementation: e7f5b4644dfbb64d5231b27adb5076e6da23e886. Next.js build: up9WPsfSzyWqNfAW6lZoQ. Protocol frozen: 2026-11-13T15:58:40.104330+00:00.

These are measured local synthetic workloads from the signed specification. Pilot and warm-up observations are excluded from the tables. The raw evidence, including a retained failed pilot, is packaged with this record. No dissertation text or signed specification was changed.

## API correctness

| Condition | Version | Intended purchases | Accepted orders | Extra orders | Lost purchases | Merged orders | Original-confirmation recoveries |
|---|---|---:|---:|---:|---:|---:|---:|
| normal | baseline | 400 | 400 | 0 | 0 | 0 | not interrupted |
| normal | recovery | 400 | 400 | 0 | 0 | 0 | not interrupted |
| sequential | baseline | 400 | 1200 | 800 | 0 | 0 | not interrupted |
| sequential | recovery | 400 | 400 | 0 | 0 | 0 | not interrupted |
| two-copy | baseline | 400 | 800 | 400 | 0 | 0 | not interrupted |
| two-copy | recovery | 400 | 400 | 0 | 0 | 0 | not interrupted |
| five-copy | baseline | 400 | 2000 | 1600 | 0 | 0 | not interrupted |
| five-copy | recovery | 400 | 400 | 0 | 0 | 0 | not interrupted |
| separate-identical | baseline | 400 | 400 | 0 | 0 | 0 | not interrupted |
| separate-identical | recovery | 400 | 400 | 0 | 0 | 0 | not interrupted |
| changed-payload | baseline | 400 | 800 | 400 | 0 | 0 | not interrupted |
| changed-payload | recovery | 400 | 400 | 0 | 0 | 0 | not interrupted |
| lost-confirmation | baseline | 400 | 800 | 400 | 0 | 0 | 0/400 |
| lost-confirmation | recovery | 400 | 400 | 0 | 0 | 0 | 400/400 |

Normal submissions and separate identical purchases show no observed correctness improvement because both versions behaved correctly in those conditions. Repeated attempts deliberately expose the baseline behaviour. A changed-payload attempt is not a new intended purchase: recovery returns a conflict and retains the original accepted result.

## Response time

Creation values below are medians of the 20 batch medians; IQRs describe those batch medians. The paired difference uses recovery minus baseline for the same batch. P95 values in the CSV/JSON describe individual successful creation or replay attempts, not independent experimental samples. Failed attempts and dropped confirmations remain in the raw attempt log.

| Condition | Baseline creation median (ms) | Recovery creation median (ms) | Paired median difference (ms) | Paired difference IQR (ms) |
|---|---:|---:|---:|---|
| normal | 15.77 | 17.18 | 1.73 | 0.41-2.22 |
| sequential | 14.33 | 16.41 | 2.10 | 1.45-2.25 |
| two-copy | 26.41 | 29.15 | 2.27 | 0.86-3.74 |
| five-copy | 47.45 | 52.24 | 6.00 | 1.03-9.38 |
| separate-identical | 12.18 | 14.21 | 1.65 | 1.31-2.40 |
| changed-payload | 15.02 | 17.39 | 3.03 | 0.94-3.44 |
| lost-confirmation | 12.98 | n/a | n/a | n/a |

A missing creation timing is marked n/a when every creation confirmation was intentionally dropped. These timings compare the combined implementations. Baseline retry-created orders and recovery replays perform different work. They do not isolate index cost or establish a production latency guarantee.

## Browser recovery

| Interrupted-confirmation condition | Baseline recovery | Recovery design | Recovery-design median time (ms) | IQR (ms) | Range (ms) |
|---|---:|---:|---:|---|---|
| lost-confirmation | 0/5 | 5/5 | 126.78 | 125.90-127.66 | 125.14-128.25 |
| reload | 0/5 | 5/5 | 130.59 | 130.00-942.01 | 126.82-964.19 |
| application-restart | 0/5 | 5/5 | 130.04 | 130.01-955.87 | 127.21-960.80 |

Recovery checks require the original stored identifier, accepted total and a single order. A quickly displayed second order counts as a recovery failure. Each restart trial retains MongoDB and the browser context while restarting the application process. Timing starts at the first permitted retry after reconnection; server startup/page-loading time is outside that timer.

## What is complete for this implementation stage

- Persistent purchase identity and submitted-cart snapshot; database uniqueness and stored-result replay; changed-payload conflicts; same-content independent purchases.
- Durable rejection and cancellation resolution, including races with acceptance and delayed retries. Terminal receipts never enter the kitchen queue.
- Shared-tab coordination and a purchase journal separate from editable-cart storage. Missing cookies or unsafe storage/lock conditions fail without replacing an uncertain purchase.
- Menu validation integration and initial kitchen queue checks. Lost-confirmation recovery after menu changes; cross-session read/bill/replay regression checks.
- 93 regression tests, production build, targeted lint, desktop/mobile keyboard recovery and focus-return checks. Pilot cancellation/rejection/shared-tab checks and the signed specification's measured API/browser workload.

## Boundaries and remaining work

This completes the specified local implementation/testing workload for Aby, excluding the explicitly optional ten-copy extension. It does not complete the whole dissertation. The other four components still need their own implementation/evaluation and final group integration. Recheck this boundary when Fahad's pricing or Ali's kitchen interfaces change. Literature synthesis, critical self-evaluation and report writing remain.

The study uses one local Windows host, a temporary standalone MongoDB and one Chrome version (desktop/mobile emulation). It does not cover real devices, WAN behaviour, database crashes/replica failover, retention expiry, load capacity, or external payment/inventory transactions. Twenty paired batches are a practical budget, not a power calculation. Other desktop activity and local scheduling may affect timings. No statistical-significance or commercial-demand claim is made.

Deployment is still separate: drain legacy active orders before enabling browser ownership; preserve HTTPS/public Host/cookies and verify the target environment. No live database or deployment was changed. The report should acknowledge Codex assistance and preserve the group-code provenance already recorded in the implementation notes.
