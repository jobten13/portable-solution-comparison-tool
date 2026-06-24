# Portable Solution Comparison Tool

**Version:** 2.0.0

Desktop-only, side-by-side comparison of portable shelter products from five vendors. Five fixed product columns; each column has a dropdown to pick a product. Display spec values are plain text from source—no sorting or unit conversion at render time. A sticky filter bar lets you threshold Bed Capacity (minimum), Internal Floorspace (minimum), and External Footprint (maximum).

Open `index.html` in a browser (double-click or any static file server). No build step, no npm dependencies. Google Fonts (DM Sans / DM Mono) load from the CDN link in `index.html`.

**Quick start:** [QUICKSTART.html](QUICKSTART.html) or [QUICKSTART.pdf](QUICKSTART.pdf).

## What’s in v2

- **Flat-table UI:** five product columns, one spec label column, ten specification rows.
- **Product picker:** options grouped under vendor `<optgroup>` headers; option text is the **product name** (plus ` *` if untested). The selected product name shows in bold. Re-select **Select a product ▾** to clear a column.
- **Filtering:** sticky filter bar with three number inputs (Bed Capacity min, Internal Floorspace min, External Footprint max). Non-matching products are disabled in the dropdowns. A column whose selected product no longer matches greys out (header + cells); the selection is kept. Greying clears when the product conforms again, the column is cleared, or all filters are removed. The ⓘ info popover stays clickable on greyed columns.
- **Cell display:** string values as-is; `null` → **TBD** pill; bed capacity on **connector** products → **N/A**.
- **Vendor logos:** each vendor's logo appears below the column dropdown when a product is selected.
- **Sticky header:** the filter bar sticks at the top of the viewport; the dropdown/logo row sticks just below it on scroll.
- **Row pinning:** pin a spec row to move it to the top of the table for the session (unpin to restore default order).
- **Product notes:** ⓘ appears beside the vendor logo when the selected product has an `infoText` field (click to open/close the shared popover). Only Base-X 8D36 has one today.
- **Untested products:** four DLX products not independently tested by UC Davis show ` *` after the name in the dropdown and a `*` icon beside the logo when selected; a footnote appears below the table when any such product is selected: *This product is included in the Vendor Product Catalog but was not independently tested by UC Davis during any IMPACTS project events or exercises.*
- **Scope:** vestibules and multi-bed configuration rows are out of scope for v1 (see [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md)).

## File roles

| File | Purpose |
|------|---------|
| `index.html` | Page shell, fonts, table structure; loads `data.js` then `app.js` |
| `styles.css` | All styling (desktop-focused, full-width layout) |
| `app.js` | Dropdowns, filtering, column fill/clear, info/untested popover, pinning, cell rendering |
| `data.js` | **Routine data updates** — `window.VPC_COMPARISON_DATA` |
| `DESIGN_DECISIONS.md` | Planning decisions that shaped the tool |
| `VERSION` | Semantic version string for this release |
| `QUICKSTART.html` | Short usage and data-edit guide (browser) |
| `QUICKSTART.pdf` | Printable quickstart (may lag `QUICKSTART.html`; regeneration deferred; in-tool help view under consideration) |

`Reference Material/` is local reference only and is not part of the shipped tool (typically left untracked in git).

## Data model (`data.js`)

Expose one object on `window.VPC_COMPARISON_DATA`:

| Key | Role |
|-----|------|
| `specRows` | Array of `{ key, label }` — row order in the table |
| `vendors` | Array of vendors, each with `name` and `products[]` |
| `specs` | Object keyed by **product id** → map of spec `key` → string or `null`, plus a hand-authored `filter` object |

**Vendor** (optional fields):

- `name` — display name (used as the `<optgroup>` label in dropdowns).
- `logo` — path to the vendor’s logo image (e.g. `logos/dlx.png`); shown below the dropdown when selected.
- `products` — `{ id, name, type }` where `type` is `shelter` or `connector`.

**Product** (optional fields):

- `infoText` — per-product note text; when present, drives the ⓘ popover for that product.
- `tested: false` — marks the product as not independently tested by UC Davis. Appends ` *` to the dropdown label and shows the `*` icon and footnote when selected.

**`filter`** on each `specs` entry (required for filtering): hand-authored structured values separate from display strings:

- `bedCapacity` — `number`, `{ min, max }`, or `{ excluded: true }`
- `extSqFt` — `number` or `{ excluded: true }`
- `intSqFt` — `number` or `{ excluded: true }`

The app does not parse display strings into filter values at runtime.

**Product ids** in `specs` must match `products[].id`. Missing or `null` display values render as **TBD** (except bed capacity on connectors → **N/A**).

Vendors in `data.js` are listed alphabetically; products keep the order defined in each vendor’s `products` array.

## Adding or changing data

1. Edit **`data.js` only** for vendors, products, labels, and cell text.
2. Save and **refresh** the browser.
3. Do not change `app.js` unless behavior changes—structure and rendering live there.

When adding a product: add it under the vendor’s `products`, then add a matching key under `specs` with every `specRows` display key present (`null` where unknown) and a `filter` object for all three filter fields.

## Release

**v2.0.0** — five-column layout and filtering (bed/internal minimums, external maximum). Branch `five-column-layout`.
