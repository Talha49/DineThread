# Fahad: catalogue consistency evidence

Implementation/protocol commit: `3611db7`. Production build: `BTW0nrxV9kXSrCR0XP9yJ`.
Signed specification: Muhammad Fahad Akhtar, B01844826; signed document unchanged.
Implementation and automated analysis are AI-assisted. All data are local synthetic fixtures.

The ten-case pilot ran each case on A and B (20 observations). The frozen study
then completed 20 matched rounds of 16 cases: 320 checkouts per version. The
independent fixture oracle found zero declared-policy violations in either
version. Automatic repricing in A is permitted and is not counted as an error.

B requested price approval in all 160 changed-price checkouts, including a second
approval in the 40 second-change cases. There were zero missed changes across 200
required confirmation opportunities, zero unnecessary conflicts in 80 unchanged
or description-only checkouts, and zero rejected valid checkouts out of 240. Both
versions rejected all 80 unavailable/deleted-selection cases. Timing distributions
and paired round differences are in `summary.json`; confirmation actions are
scripted and do not measure human decision time.

Six browser journeys passed at 1280 and 390 pixels (12 runs), including explicit
price approval and a repeated confirmation click. Screenshots show the changed
total before approval. The full regression suite passed 110 tests in 11 suites.
Separate checks cover forged prices, invalid IDs, lost-confirmation replay after
menu changes, omitted edit fields, option identities and validation-to-insert
overlap. This last case demonstrates the boundary: a later availability change
does not reserve or invalidate a snapshot already read for insertion.

The initial unit-test draft assumed Zod omitted defaulted arrays; it failed and
was replaced with a real endpoint check. That check verifies persisted option IDs
and passed. An initial build stopped during cleanup; a second failed for a missing
test-only auth secret. The final clean build uses a generated local secret and a
separate output folder. These setup failures are not counted as experiment results.

Reproduce with `scripts/research-build.js`, `scripts/catalogue-experiment.js
--pilot`, then the frozen main run and `scripts/catalogue-browser.js`. Supply
`RESEARCH_DIST_DIR` for the selected production build. The standalone
`scripts/catalogue-oracle.js` rechecks archived observations without importing
application pricing. Raw pilot, measured and browser evidence is compressed in
`evidence/` with SHA-256 hashes. Local results do not establish production capacity,
stock reservation, customer preference or financial settlement correctness.
