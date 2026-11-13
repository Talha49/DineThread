# Customer ordering accessibility: local comparison

Recorded 13 November 2026. These are technical checks on synthetic menus, not
participant results or a claim of full WCAG conformance. The signed specification
is unchanged. Code, test execution and this evidence record were AI-assisted.

## Builds and scope

A is production build `m83pPGcb6p2ZgPs9s0OoB` (workflow implementation).
B's keyboard inspection used `Tr08L6Iuyz9VH_OifDqm1`; final automated and NVDA
retests used `q6nMds_BQKnZGtsMjQFeu`. The latter moves the bill confirmation into
the already-mounted status region. Subsequent source cleanup only escapes two
JSX quotation marks and removes trailing whitespace. Source manifests preserve
the actual build and dirty-tree provenance. The same ordering backend and fixtures
were used for A and B.

Six journeys cover a simple item, size/extras, cart quantity, missing table,
unavailable item and order/bill status. Chromium covers 1280 and 390 CSS pixels,
plus four focused journeys at 320 pixels. Firefox checks options, missing table
and status at 1280. Manual keyboard observations were recorded before consulting
axe for each version. The 320 checks change viewport width, not browser zoom.

| Check | A | Final B |
| --- | ---: | ---: |
| Keyboard journeys (6 desktop + 4 narrow) | 10 | 10 |
| Blocked keyboard steps | 9 | 0 |
| Chromium journey runs / captured states | 16 / 75 | 16 / 75 |
| Chromium states with axe violations | 75 | 0 |
| Chromium rule occurrences across states | 225 | 0 |
| Firefox journey runs / captured states | 3 / 17 | 3 / 17 |
| Firefox states with axe violations | 17 | 0 |
| Firefox rule occurrences across states | 34 | 0 |
| Observed horizontal page overflow | 0 | 0 |

Rule occurrences count repeated findings across states, not unique defects.
Chromium found three rule families: `aria-required-children`, `button-name` and
`color-contrast`. Firefox found the first two. No axe result exists for the
keyboard-only runs; their summary's empty violation arrays do not mean they
were scanned. A's blocked item activation was explicitly recorded before using
a pointer fallback to inspect later independent states. Thus its eventual
functional completion does not constitute a keyboard pass. The automation
checked stored order totals, absence of invalid accepted orders, actual status
versions and successful restoration; these assertions passed in the recorded runs.

## Findings across methods

- Keyboard and NVDA exposed unreachable item cards, missing dialog naming/focus
  and missing option/quantity semantics. Axe alone did not establish focus order,
  restoration, visible focus or whether a status announcement was heard.
- Axe added the malformed category tablist and pale text contrast findings.
  Button names overlapped the manual findings. Category navigation now uses
  navigation/buttons rather than incomplete tab semantics.
- The revised dialog traps focus, restores the opener and makes background
  content inert. Native keyboard/NVDA checks verified its named item dialog,
  pressed option state and named quantity controls. Desktop and narrow screenshots
  preserve the focused boundary and wrapped controls.
- NVDA announced the no-table error in both versions. It announced Preparing and
  Ready in B. A's actual DOM versions were verified while no corresponding new
  status speech appeared during the recorded observation windows.
- The first B bill test failed: inserting a new live region did not produce the
  expected speech. Moving the message into the persistent status region fixed
  this. The final native run recorded “Order status: Ready. Bill requested - your
  server is on the way.” in NVDA's speech log. Both the failure and retest remain
  documented in `screenreader.md`.

NVDA 2026.3.1 ran locally with a separate portable configuration and was stopped
after testing. The official installer had a valid NV Access signature. Only
task-related speech excerpts are archived; raw desktop speech logs are private
and excluded. These are AI-assisted native desktop observations, not a blind
participant study. They do not establish that every screen-reader/browser pairing
works. Selected WCAG criteria remain bounded by the states and methods tested;
absence of automated violations is not an accessibility certification.

## Reproduction and limits

`protocol.json`, manual observation files, `screenreader.md`, `summary.json` and
the compressed evidence manifest preserve the comparison. Run
`node scripts/accessibility-analyse.js` against the original local evidence to
regenerate the table. Each browser script creates an isolated synthetic MongoDB
fixture; no customer or deployment data were used.

The full unit suite passed 145 tests in 14 suites. Targeted JSX lint completed
with zero errors and nine existing image/hook warnings. The first lint invocation
used an incorrect file path and was rerun with the actual paths; both records
remain local. Earlier pilots, intermediate B scans and the final scans are
retained separately. No failed trial is substituted by a fabricated success.


## Combined-build and native zoom follow-up

After the theme work, Chromium repeated all 16 journeys (75 states) and Firefox
repeated three journeys (17 states): zero axe violations and all functional
assertions passed. A separate native 200% zoom inspection found a floating-cart
layer above the item dialog. That visual defect was fixed in final build
`1KRlhsS6Ud78s2Gls_-ZQ`, then retested with native focus/zoom captures and two
focused axe journeys, again with zero violations. See `zoom-and-contrast.md` for
the matched measurements, the corrected colour parser, superseded outputs and
remaining scope limits. The earlier screen-reader results remain tied to their
recorded builds; no new NVDA session is claimed for this visual-only follow-up.
