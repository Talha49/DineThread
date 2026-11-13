# Signed specification implementation log

This branch starts at merged main `d6050394918cc676f12b213b0813591e75ceb4e8`.
The signed specifications remain unchanged. Implementation and test scripts are
AI-assisted; results will be recorded only after the corresponding runs finish.

Work order: Fahad (catalogue consistency), Ali (staff state transitions), Bibek
(customer accessibility), then Talha (theme preview scheduling). Each comparison
holds the other members' behaviour constant. Aby's accepted-order recovery and
separate-purchase behaviour remain integration requirements.

## Fahad protocol

Compare automatic authoritative repricing (A) with selected-price reconfirmation
(B), both using the recovery request protocol. Use eight conditions with one and
four selected items: unchanged, price increase, price decrease, unavailable item,
deleted option, modifier price change, unrelated description edit and a second
price change during confirmation. An independent fixture table defines expected
responses and integer-pence totals. A's documented repricing is not a defect.

Run ten pilot cases, then freeze the protocol. Main runs use 20 matched rounds,
alternating A/B order, with reset fixtures and separate warm-ups. Record validation
time separately from API time and scripted checkout duration. Confirm six browser
journeys and additional replay, tampering, identifier and insert-boundary checks.
An edit after validation can precede insertion: no reservation or transaction-wide
menu snapshot is claimed. Preserve pilot failures and subsequent retests.

## Ali protocol

Compare unconditional writes with state/version-conditional writes using the same
atomic event log, ownership checks and four-second browser polling. Check all 25
state pairs separately. Four main schedules use distinct action IDs: identical
actions, different actions, a delayed old action and a bill/preparation overlap.
A client barrier and server intervals establish overlap for the three concurrent
schedules. The delayed schedule is intentionally sequential. Ten pilot histories
per version precede 25 repetitions of each schedule per version. An independent
checker evaluates histories and refreshed follow-up actions. Browser checks cover
two staff sessions and one customer, including a verified payment commit whose
HTTP acknowledgement is lost. No real payment is processed.

## Frontend motion ownership

Existing Framer Motion owns dialog/cart state transitions; CSS owns focus and
colour feedback. No additional animation library is needed. Edited motion uses
transform/opacity with immediate reduced-motion behaviour. Native scrolling,
keyboard focus and anchors stay available. Compare the production bundle before
and after edits; no arbitrary performance target is assumed. Playwright checks
desktop/mobile loading, errors, confirmation, recovery, focus return and overflow.

## Evidence boundaries

Automated accessibility checks cannot substitute for the signed manual keyboard,
contrast, zoom and NVDA checks. Theme timing runs must distinguish frame callbacks
from physical screen presentation. Local synthetic tests do not establish live
deployment reliability, customer satisfaction or commercial benefits.
