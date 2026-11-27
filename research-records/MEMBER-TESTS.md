# What each DineThread member tested

## Aby Daniel Varghese — order recovery

Aby followed a checkout where the diner accepted a price change from $8 to $9 and the confirmation was lost. He checked the receipt identifier against the stored order. Retrying returned that identifier and left one entry in the kitchen. A fresh purchase of the same items received its own identifier. [Recovered orders on mobile and desktop](https://github.com/Talha49/DineThread/blob/616bfa636c56a65c8cc7ea1f9e7fb4debb89eaf0/research-records/integration/price/results.json)

## Muhammad Fahad Akhtar — catalogue pricing

Fahad examined which menu edits should send a diner back to the confirmation step. The revised checkout asked for approval on all 160 purchases where the selected price changed. Across 80 purchases with unchanged pricing or description-only edits, it raised no price conflict. [Catalogue checkout results](https://github.com/Talha49/DineThread/blob/616bfa636c56a65c8cc7ea1f9e7fb4debb89eaf0/research-records/catalogue/RESULTS.md)

## Talha Khan Ghauri — theme preview

Talha compared two ways of sending edits from Design Studio to the menu preview. Buffering preserved the final theme, but the browser still delivered 20 updates in the spaced workload and 60 in the rapid workload under either strategy. He checked the saved configuration as well as the message count. [Theme-preview timing and correctness results](https://github.com/Talha49/DineThread/blob/616bfa636c56a65c8cc7ea1f9e7fb4debb89eaf0/research-records/theme/RESULTS.md)

## Bibek Rai — keyboard accessibility

Bibek personally followed keyboard focus from a dish into its dialog and back to the originating dish. He navigated with Tab, opened the dialog with Enter and closed it with Escape. The archive records the separate NVDA sessions and their speech output in the screen-reader notes. [Dish-dialog keyboard check](https://github.com/Talha49/DineThread/blob/616bfa636c56a65c8cc7ea1f9e7fb4debb89eaf0/research-records/accessibility/RESULTS.md) · [Screen-reader session notes](https://github.com/Talha49/DineThread/blob/616bfa636c56a65c8cc7ea1f9e7fb4debb89eaf0/research-records/accessibility/screenreader.md)

## Ali Raza — kitchen workflow

Ali examined what happened when two staff sessions both acted on version 1 of a kitchen order. The server accepted one update and rejected the stale one with HTTP 409. He found version 2 in the stored record, with the bill request retained and the receipt still showing $8. [Conflicting staff actions and the bill request](https://github.com/Talha49/DineThread/blob/616bfa636c56a65c8cc7ea1f9e7fb4debb89eaf0/research-records/integration/checkout/bill-and-staff.json)

## References

The links under each member’s name point to the recorded version of that study. The [archive index](README.md) also lists the implementation commits and the separate integration checks.
