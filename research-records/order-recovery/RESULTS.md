# Aby – measured order recovery results

Measured implementation: eb79c4fa7b8ab71d42c242178dbf6fab86f03b2e. Next.js build: i3UZ6ezuUgNDVpONeR7Uq. Protocol frozen: 2026-11-23T00:07:50+00:00.

Local synthetic trials. Acceptance issues recorded: 0. See summary.json for individual issues.

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


## Response time

Creation values below are medians of the 20 batch medians; IQRs describe those batch medians. The paired difference uses recovery minus baseline for the same batch. P95 values in the CSV/JSON describe individual successful creation or replay attempts, not independent experimental samples. Failed attempts and dropped confirmations remain in the raw attempt log.

| Condition | Baseline creation median (ms) | Recovery creation median (ms) | Paired median difference (ms) | Paired difference IQR (ms) |
|---|---:|---:|---:|---|
| normal | 15.78 | 16.63 | 1.29 | 0.01-1.83 |
| sequential | 13.42 | 15.78 | 2.14 | 1.97-2.37 |
| two-copy | 16.20 | 18.12 | 1.64 | 1.07-2.59 |
| five-copy | 34.18 | 40.98 | 7.07 | 5.38-8.44 |
| separate-identical | 12.27 | 14.61 | 2.19 | 1.55-2.67 |
| changed-payload | 14.32 | 15.84 | 1.54 | 1.24-2.01 |
| lost-confirmation | 13.95 | n/a | n/a | n/a |

A missing creation timing is marked n/a when every creation confirmation was intentionally dropped. These timings compare the combined implementations. Baseline retry-created orders and recovery replays perform different work. They do not isolate index cost or establish a production latency guarantee.

## Failed API attempts

Rates use all attempts in the same condition and version. The JSON includes zero-count categories. Elapsed time runs from sending the request to receiving the error or losing the response.

| Condition | Version | Outcome | Attempts | Rate (%) | Batch rate IQR (%) | Median (ms) | P95 (ms) |
|---|---|---|---:|---:|---:|---:|---:|
| changed-payload | recovery | Expected conflict | 400/800 | 50.00 | 50.00-50.00 | 10.49 | 12.80 |
| lost-confirmation | baseline | Dropped confirmation | 400/800 | 50.00 | 50.00-50.00 | 18.80 | 22.34 |
| lost-confirmation | recovery | Dropped confirmation | 400/800 | 50.00 | 50.00-50.00 | 19.69 | 23.25 |

## Browser recovery

| Interrupted-confirmation condition | Baseline recovery | Recovery design | Recovery-design median time (ms) | IQR (ms) | Range (ms) |
|---|---:|---:|---:|---|---|
| lost-confirmation | 0/5 | 5/5 | 100.52 | 94.41-105.30 | 91.64-111.49 |
| reload | 0/5 | 5/5 | 112.00 | 108.66-929.72 | 89.68-942.36 |
| application-restart | 0/5 | 5/5 | 132.99 | 123.69-950.94 | 116.50-956.61 |

| Condition | Version | Failed trials | Timeouts | Median time to failure (ms) |
|---|---|---:|---:|---:|
| lost-confirmation | baseline | 5/5 | 0 | 107.73 |
| lost-confirmation | recovery | 0/5 | 0 | n/a |
| reload | baseline | 5/5 | 0 | 114.38 |
| reload | recovery | 0/5 | 0 | n/a |
| application-restart | baseline | 5/5 | 0 | 138.79 |
| application-restart | recovery | 0/5 | 0 | n/a |

Recovery checks require the original stored identifier, accepted total and a single order. A quickly displayed second order counts as a recovery failure. Each restart trial retains MongoDB and the browser context while restarting the application process. Timing starts at the first permitted retry after reconnection; server startup/page-loading time is outside that timer.
