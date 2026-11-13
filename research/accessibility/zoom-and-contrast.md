# Native zoom and contrast addendum

The final local inspection used Chrome on Windows, with native Ctrl+plus zoom,
not Playwright viewport resizing. The browser's normal content area was 929 x
917 CSS pixels. At 200% it was 464 x 458, devicePixelRatio was 2 and the browser UI
reported 200%. Zoom was restored before closing the temporary browser. These are
AI-assisted technical observations on synthetic fixtures, not participant data.

A retained build `m83pPGcb6p2ZgPs9s0OoB`; final B used
`1KRlhsS6Ud78s2Gls_-ZQ`. Session `screenreader-1794599076914` records menu,
customisation, cart and status in both versions. All eight measurements found no
horizontal page overflow and no horizontally clipped sampled controls. Vertical
scrolling remains necessary at this short enlarged viewport. This 200% check
supplements the separate 320-CSS-pixel reflow matrix; it is not a 400% test.

The earlier session `screenreader-1794598647715` found the floating cart painted
above the item dialog. The final modal layer now sits above that control. A native
Shift+Tab check scrolled the Add button into view, with its full focus ring visible
and no floating cart covering it. Native captures preserve the final dialog,
focused Add button, cart and status. The UI Automation focus field again remained
on the address bar despite the visible page focus; that field is not used as proof.

The contrast helper resolves CSS colours (including Tailwind's OKLCH values)
through a canvas to sRGB before calculating relative luminance. It records the
foreground, composited background, ratio and threshold for sampled text. Gradients
or ancestor opacity are marked ambiguous; inactive controls are excluded. A supplied 21 sampled text records across the four states and B supplied 22
(including its added live status sentence). Three A records were below the
relevant threshold: the footer text, cart variant label and table label. Final B
had none below threshold in this sample. This is a
sample of styles, not an exhaustive check of every nested text node or theme.
The accompanying axe scans provide separate, broader automated evidence.

The first helper incorrectly parsed OKLCH numbers as RGB. Its contrast outputs in
`screenreader-1794598647715` are invalid and are not used for these conclusions;
its zoom dimensions and native screenshots remain useful. Playwright's native-zoom
screenshots also cropped the visual area. Native Windows captures, not those
cropped images, support the visual observations. Both attempts are retained.

Threshold interpretation follows [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
The distinction between zoom and the 320-pixel reflow boundary follows
[W3C reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
No full WCAG conformance claim is made.


## References

W3C (no date) *Understanding Success Criterion 1.4.3: Contrast (Minimum)*.
Available at: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
(Accessed: 13 November 2026).

W3C (no date) *Understanding Success Criterion 1.4.10: Reflow*.
Available at: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
(Accessed: 13 November 2026).
