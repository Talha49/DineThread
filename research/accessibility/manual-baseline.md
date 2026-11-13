# Baseline observations before axe

Observed 13 November 2026 using synthetic fixtures, production build
`m83pPGcb6p2ZgPs9s0OoB`. These are AI-assisted keyboard/DOM inspections and
screenshot review, not NVDA or human participant results.

The two-journey pilot and six-journey keyboard run recorded menu cards that
cannot receive Tab focus. The scripts continued through pointer fallback and
explicitly recorded the blocked step. The customisation dialog had no accessible
name, retained focus outside on opening, and exposed unnamed quantity buttons.
Variant and extra buttons did not expose selected state. Menu toolbar icon
buttons lacked accessible names. The cart already had named quantity buttons,
an alert for invalid table selection, and focus containment.

The screenshot review of the options dialog shows a legible layout at desktop
width, but the pilot captured its CSS entrance before it settled. Later captures
wait 450 ms in both versions. The old screenshot is retained, not used as a
contrast measurement. Small pale status and cart text needs rendered contrast
measurement. Ready feedback has a toast, but earlier order states lack an
explicit live status message. NVDA announcements remain untested.

Raw first runs: `accessibility-baseline-keyboard-1794590264449` (pilot) and
`accessibility-baseline-keyboard-1794590305450` (six desktop journeys plus four
320-pixel state journeys). Nine open-item steps in the full run were unreachable
by Tab. Functional completion after pointer fallback is not a keyboard pass.
