# Post-review regression checks

These fixes follow the group experiments recorded at commit `998c4f3`. The original commits and experiment folders have not been rewritten. This directory records additional regression checks, not replacement experimental results.

## Changes

- Theme validation now rejects malformed hex, RGB and HSL colours before updating the preview or database. The supported subset is hex with 3, 4, 6 or 8 digits, `transparent`, and comma-separated RGB/HSL functions. Other CSS colour syntaxes are outside this editor's supported input format. The grammar was checked against [CSS Color 4](https://www.w3.org/TR/css-color-4/).
- Reset and saved-theme deletion are blocked while a save is pending. A failed deletion retains the saved theme in the interface. Reset remains available after saving finishes and persists the defaults.
- The unauthenticated `/api/test-db` route was removed. The test harness still creates its own local synthetic fixtures.
- The element-width hook now observes panels that mount after loading and disconnects when the element changes. The dashboard toolbar wraps when its controls cannot fit on one row.
- JSX text escapes fix lint errors without changing the displayed wording. Sample highlighting is described as a demonstration, including in the six locale dictionaries and their generator. The unsupported sales-increase testimonial was removed. The separate background-removal feature was not changed.

## Validation

| Check | Observed result | Record |
| --- | --- | --- |
| Jest suite | 182 tests passed across 16 suites | `checks/tests.txt` |
| Changed JavaScript/JSX lint | No errors; five existing image-optimisation warnings | `checks/lint.txt` |
| Final optimised build | Completed; build ID `CV-ULe8Qg6TuXxE8MdjJg` | `checks/build.txt` |
| Dashboard regression | 16 records passed at 1280px and 390px, with reduced motion | `checks/browser.json` |
| Theme correctness | 48 cases and six additional save checks passed | `checks/theme-correctness.json` |
| Localisation generator | Six dictionaries parsed and retained the corrected copy | `checks/locales.txt` |

The dashboard checks hold a real branding request open, verify that reset cannot alter the draft during that save, then reset, reload and inspect the database. Invalid colours return HTTP 400 without changing the saved configuration. A simulated HTTP 503 deletion is retained and a later retry succeeds. The removed debug URL returns HTTP 404, with the users, restaurants and menu-items collections each remaining at one fixture record. The phone preview opens and closes with both controls inside the viewport. There were no page runtime errors during these journeys. Selected screenshots were also visually inspected.

The 48-case theme run used build `GQ3zLDqq5ZrKUM0HktJk_`, before the final toolbar-only `flex-wrap` adjustment. The 16-record dashboard run and final build include that adjustment. Each run's source manifest records the base commit, working-tree changes, build identifier and source hashes. No original timing or profiling measurements were rerun or relabelled as measurements of these changes.

An initial restricted-environment test attempt could not connect to the temporary local MongoDB (`EACCES`). The same suite was rerun with local-process access and passed. No production database or live customer records were used. These checks do not establish full accessibility conformance or production performance.

## Reproduction

Install the repository's locked dependencies and use the existing local MongoDB/Chrome test setup. In PowerShell:

```powershell
npm test -- --runInBand
$env:NEXT_PUBLIC_THEME_RESEARCH = '1'
node scripts/research-build.js qa-results/build-review-reproduction
$env:RESEARCH_DIST_DIR = 'qa-results/build-review-reproduction'
node scripts/review-fixes-browser.js
node scripts/theme-browser.js correctness
```

Use a fresh build directory. The research flag is for these local checks; it is not a deployment instruction. `before/` contains the original probes that reproduced the invalid-colour, reset-race and debug-route defects.
