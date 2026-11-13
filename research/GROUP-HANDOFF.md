# Group 7: implementation and testing handoff

This branch completes the remaining code changes and bounded technical tests for
Fahad, Ali, Bibek and Talha, building on Aby's merged order-recovery work. Signed
specifications were read as requirements and were not edited. Code, test automation
and these evidence notes are AI-assisted. All experiments use local synthetic data.

| Member | Implemented | Recorded evidence |
| --- | --- | --- |
| Muhammad Fahad Akhtar (B01844826) | Stable menu-option identities, authoritative pricing and availability validation, explicit changed-price reconfirmation, preserved accepted-order replay | 320 checkouts per policy; zero policy violations; 12 desktop/mobile browser journeys |
| Ali Raza (B01845771) | Atomic versioned kitchen transitions, shared bill-request version, terminal payment state, repeat-action recovery and stale-decision handling | 100 histories per version; revised version has zero invalid histories in the tested schedules; 10 multi-session browser journeys |
| Bibek Rai (B01845378) | Keyboard item activation, named controls/dialogs, trapped/restored focus, contrast corrections, persistent status/bill announcements, reduced motion and corrected dialog layer | Chromium/Firefox scans, keyboard checks, actual NVDA inspection and native zoom/contrast follow-up; final selected scans have zero violations |
| Talha Khan Ghauri (B01850800) | Validated theme messages, one pending frame, revision/handshake checks, latest-state save/reset, offered fonts and bounded mobile preview | 48 correctness cases; 140 paired timing sequences; 15 separate profiling pairs; desktop/mobile dashboard checks |
| Aby Daniel Varghese (B01820561) | Existing merged submission/recovery implementation retained | Combined-build lost-confirmation, reload and application-restart checks plus rejected-purchase, cancellation and multiple-tab checks passed |

## How the pieces connect

Fahad decides whether the selected menu items and prices are still acceptable.
Aby gives each intended purchase its own identity and recovers its confirmation
without creating another order. Ali controls what happens after acceptance and
records kitchen/billing state changes. Bibek makes the customer journey reachable
and understandable with keyboard, screen reader and enlarged text. Talha keeps
merchant theme edits, the preview and the saved public menu consistent.

The combined build passed 159 unit/integration tests in 15 suites before the final
CSS-only corrections. Browser regression then passed the 12 catalogue journeys,
10 kitchen journeys and Aby's recovery pilot with additional UI checks. Chromium
rechecked 75 accessibility states and Firefox 17, with zero axe violations.
The final visual corrections received native zoom/focus checks, two focused axe
journeys, and desktop/mobile dashboard bounds checks. Production builds completed.

## Findings the report must preserve

- Fahad's automatic-repricing baseline is an intentional policy, not an error.
  Scripted confirmation times do not measure customer decision time.
- Ali's baseline failed deliberately conflicting histories; that is not an estimate
  of the failure rate in restaurants. Payment status recording is not card settlement.
- Bibek's first bill-announcement check failed and was fixed, then verified with
  NVDA. Automated scans alone did not establish the speech or focus behaviour.
  The final zoom check found and fixed the floating-cart overlap. No full WCAG
  certification or participant study is claimed.
- Talha's main study found no message reduction at the achieved edit rates. Both
  modes also produced 60 median menu-subtree commits in the separate rapid profiling
  conditions. Some conditions added delay. The original 240-edit rate was reduced
  after the pilot could not sustain it; the limitation must stay in the report.
- The evidence is local, synthetic and bounded. No commercial demand, customer
  satisfaction, live deployment capacity or universal correctness was measured.

## Evidence and next work

Start with [Fahad's results](catalogue/RESULTS.md), [Ali's results](workflow/RESULTS.md),
[Bibek's results](accessibility/RESULTS.md), [Talha's results](theme/RESULTS.md), and
[Aby's earlier results](order-recovery/RESULTS.md). Each area contains protocols,
analysis and compressed raw evidence with SHA-256 manifests. Failures, pilots,
warm-ups and successful measured runs are kept distinct.

The next stage is the report: each member should understand and review their code,
explain the literature and design choice, interpret the actual results and limits,
and write their contribution and reflection. The code/tests do not themselves
complete the literature review, dissertation or viva. Keep the recorded development
history and acknowledge assistance according to the course requirements.

The work is on `codex/group-spec-completion`. It is prepared for group review;
it has not been merged into main or deployed. Review the pull request before
changing the shared main branch.
