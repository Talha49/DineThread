# Talha: theme-preview correctness and performance

The signed specification (Ghauri, 2026) is unchanged. Implementation, technical testing and this
evidence record are AI-assisted. Fixtures contain 24 synthetic dishes in four
categories. No participant or merchant-satisfaction study was conducted.

## Implementation and correctness

One preview controller owns each iframe. Immediate A and frame-buffered B share
validation, unchanged-value suppression, origin/source checks, reload handshake,
revision ordering and acknowledgement checks. Saving reads the latest validated
editor configuration even before its preview is delivered. Reset replaces the
configuration, and invalid input preserves the previous valid state.

The final correctness matrix passed all 48 cases: eight scenarios, three layouts,
and both strategies. It checks single edits, synchronous bursts, layout changes,
reset, save while delivery is pending, invalid input, preview reload and outdated
messages. Stored values and selected computed styles agree after reopening the
public menu. The save-during-burst checks confirm the latest configuration was
saved while B still had a delivery pending. Three previously unbundled offered
fonts (Playfair Display, Montserrat and Bebas Neue) are now included; checks verify
the selected primary font actually loads, rather than accepting its fallback.
The dashboard controls were also exercised at 1280 and 390 CSS pixels.

## Frozen timing comparison

Application/protocol commit: `69149a5`. Main production build:
`P2SsZaMbq8shVH6LdGCLH`. Chrome 157.0.8103.51, Node 20.19.4, Windows 11,
AMD Ryzen 7 4800H, about 16 GB RAM. The adapter reports 144 Hz; observed RAF
intervals are recorded separately. Reduced motion was enabled for both versions.

The original 240-edit pilot could not sustain two-second grid sequences: actual
runs took about 5.6-5.9 seconds. Before freezing the main protocol, the rapid
condition was reduced to 60 edits over two seconds. Two subsequent pilots were
retained; the final 24-run pilot had correct states and stable achieved durations.
The main matrix retains all 140 pairs (280 measured runs), plus 16 excluded
warm-ups. Complete configurations were reset before each sequence. Execution
alternated A/B, reusing one warmed page per strategy within each layout/width
block. The local experimental shell uses the real editor, transport, branding
API and public-menu components, with different dashboard surroundings.

All 280 measured runs had the correct final state, a matching acknowledgement,
and visible parent/preview pages. Achieved sequence durations were 1999.3-2015.8 ms.
Timing runs from the last editor event to the parent receiving an acknowledgement
after React application and computed-style checks at a frame callback. This is
not physical paint or perceived responsiveness.

| Width / layout / rate | Pairs | A median ms | B median ms | Median paired B-A ms |
| --- | ---: | ---: | ---: | ---: |
| 1280/grid/spaced | 20 | 19.30 | 17.65 | -1.30 |
| 1280/grid/rapid | 20 | 18.45 | 21.90 | 3.30 |
| 1280/list/spaced | 20 | 14.35 | 15.20 | -0.75 |
| 1280/list/rapid | 20 | 15.15 | 16.25 | 1.05 |
| 1280/bento-magazine/spaced | 20 | 8.55 | 11.45 | 2.00 |
| 1280/bento-magazine/rapid | 20 | 8.35 | 12.05 | 2.95 |
| 390/grid/spaced | 10 | 17.30 | 20.40 | 4.70 |
| 390/grid/rapid | 10 | 17.55 | 20.30 | 1.40 |

The paired column is the median of sequence differences, not the difference of
the two marginal medians. Full quartiles, ranges and each pair remain in
`summary.json`. Individual events are not independent experimental samples.
Both versions sent 20 messages in every spaced run and 60 in every rapid run.
Thus this main workload showed no message-count reduction. Several conditions
showed additional final-update delay with buffering. Small differences vary by
layout and should not be described as a universal advantage or disadvantage.

These achieved rates (about 10 and 30 edits/second) are below the display's nominal
refresh frequency. They do not establish coalescing's benefit when edits exceed
frame opportunities. The separate synchronous-burst correctness cases establish
final-state preservation, not a performance result for that faster workload.

## Separate rendering comparison

Production profiling build: `8irlSw7JDoN1clOntNZCf`, built with explicit
`next build --profile`. It uses the same theme pipeline as the main build.
Five paired rapid sequences per desktop layout produced 30 runs with real React
measurements. The menu subtree Profiler excludes the ThemeProvider's own processing;
CDP metrics and six browser traces provide separate context. The first pair per
layout was traced for both strategies, so tracing overhead is retained and labelled.
These timings are not pooled with the unprofiled main results.

| Layout | Pairs | A median commits | B median commits | A median render ms | B median render ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1280/grid/rapid | 5 | 60.0 | 60.0 | 64.20 | 60.70 |
| 1280/list/rapid | 5 | 60.0 | 60.0 | 61.30 | 58.80 |
| 1280/bento-magazine/rapid | 5 | 60.0 | 60.0 | 54.50 | 55.20 |

[React's Profiler documentation](https://react.dev/reference/react/Profiler)
(React, no date) explains the measurement scope and profiling overhead. No React commit count is
claimed for the ordinary production build: those measurements are marked unavailable.
The first profiling attempt returned no React samples and stopped with an assertion.
Next 15.5.9's build CLI required `--profile`; the config field alone did not enable
the profiling renderer. The failed attempt and successful rerun are both retained.

## Final integration and reproduction

After measurement, two visual corrections were made: the item dialog now paints
above the floating cart, and the narrow dashboard preview panel has no intrinsic
minimum width that pushes its close control off screen. These surfaces were not
open in the timing workload. Final UI build `1KRlhsS6Ud78s2Gls_-ZQ` is checked
separately. Source manifests record the working tree at each execution; the
profiling run's later tree includes these UI changes although its compiled build
predates them. Do not confuse those tree hashes with a new profiling build.

Reproduce with `scripts/research-build.js`, `scripts/theme-browser.js` and
`scripts/theme-analyse.js`. Set `NEXT_PUBLIC_THEME_RESEARCH=1` only for the local
research build and `RESEARCH_DIST_DIR` to the chosen folder. `THEME_PROFILE_BUILD=1`
adds the required CLI profiling flag. The research route and instrumentation are
restricted to explicit research configuration and localhost. Raw pilots, main
runs, correctness checks, profiles, traces, screenshots and build/source records
are archived with SHA-256 hashes. The analysis script had an extra closing
parenthesis during its first invocation; it was corrected before producing any
summary. No failed run was replaced by a fabricated success.


## References

React (no date) *Profiler*. Available at: https://react.dev/reference/react/Profiler
(Accessed: 13 November 2026).

Ghauri, T.K. (2026) *DineThread: MSc Masters Project Specification*.
University of the West of Scotland. Signed individual specification, 20 October.
Unpublished group project requirements supplied by the student.
