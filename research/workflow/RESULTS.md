# Ali: kitchen workflow and billing evidence

Implementation/protocol commit: `5d4422f`. Production build: `m83pPGcb6p2ZgPs9s0OoB`.
Signed specification: Ali Raza, B01845771; signed document unchanged.
Implementation, test automation and analysis are AI-assisted; fixtures are synthetic.

The ten-history pilot ran on both versions before the protocol was frozen.
The main comparison completed 25 repetitions of four schedules: 100 histories per
version. All 100 revised histories passed the independent state/history checker.
All 100 unconditional baseline histories contained at least one violation under
these deliberately conflicting schedules. This is not a restaurant failure rate.
Server intervals established overlap in the 75 concurrent histories per version;
the 25 delayed-action histories were intentionally sequential. Fresh follow-up
decisions completed in all 100 histories per version.

The automated suite covers all 25 state pairs, terminal payment, shared bill-request
versions, ownership and repeated-action recovery. The complete suite passed 144
tests in 13 suites. Accepted transitions change state, increment version and append
an event atomically within one order document. A stale decision is not silently
retried against a newer version.

Five browser journeys ran on A and B, each using two staff sessions and one
390-pixel customer view. They cover the complete sequence, a stale staff screen,
bill/preparation overlap, a lost payment acknowledgement and reload before retry.
All ten scripts reached their expected endpoints; baseline acceptance of stale
commands remains a recorded policy defect. The response-drop checks verified the
accepted payment event in MongoDB before discarding the HTTP response. Recovery
left one accepted payment event and the original 2250-minor-unit total.

Both versions retain four-second polling. Browser timing starts after independent
database read-back confirms the mutation and ends when all three tested screens
display its version. It includes polling and any explicit History navigation;
it is not the exact database commit-to-paint interval. API timings and paired
history differences are separate in `summary.json`. The paid summary aggregates
accepted snapshots; it does not process card payments or prove settlement correctness.

Raw pilot, main and browser results, screenshots, unit log and source/build
manifests are under `evidence/`, with compressed files and SHA-256 hashes.
Reproduce with `scripts/research-build.js`, `scripts/workflow-experiment.js
--pilot`, the frozen main run and `scripts/workflow-browser.js`. The independent
checker is `scripts/workflow-oracle.js`. Production and real customer data were
not used. These schedules do not prove correctness under every possible history.
