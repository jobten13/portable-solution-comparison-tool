# VPC Comparison Tool

**Version:** 1.0.0

Desktop-only, side-by-side comparison of portable shelter products from five vendors. Three fixed columns; each column has a dropdown to pick a product. Spec values are plain text from source—no sorting, filtering, or unit conversion.

Open `index.html` in a browser (double-click or any static file server). No build step, no npm dependencies. Google Fonts (DM Sans / DM Mono) load from the CDN link in `index.html`.

**Quick start:** [QUICKSTART.html](QUICKSTART.html) or [QUICKSTART.pdf](QUICKSTART.pdf).

## What’s in v1

- **Flat-table UI:** three product columns, one spec label column, ten specification rows.
- **Product picker:** flat list of options labeled `Vendor — Product` (e.g. `DLX — X-24`). Re-select **Select a product ▾** to clear a column.
- **Cell display:** string values as-is; `null` → **TBD** pill; bed capacity on **connector** products → **N/A**.
- **Vendor logos:** each vendor's logo appears below the column dropdown when a product is selected.
- **Sticky header:** the dropdown/logo row pins to the top of the viewport on scroll.
- **HDT note:** ⓘ appears beside the vendor logo only when an HDT product is selected (click to open/close).
- **Untested products:** four DLX products not independently tested by UC Davis show an asterisk (`*`) in the dropdown; a footnote appears below the table when any such product is selected.
- **Scope:** vestibules and multi-bed configuration rows are out of scope for v1 (see [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md)).

## File roles

| File | Purpose |
|------|---------|
| `index.html` | Page shell, fonts, table structure; loads `data.js` then `app.js` |
| `styles.css` | All styling (desktop-focused, ~1100px centered card) |
| `app.js` | Dropdowns, column fill/clear, HDT popover, cell rendering |
| `data.js` | **Routine data updates** — `window.VPC_COMPARISON_DATA` |
| `DESIGN_DECISIONS.md` | Planning decisions that shaped v1 |
| `VERSION` | Semantic version string for this release |
| `QUICKSTART.html` | Short usage and data-edit guide (browser) |
| `QUICKSTART.pdf` | Same guide as PDF for sharing/printing |

`Reference Material/` is local reference only and is not part of the shipped tool (typically left untracked in git).

## Data model (`data.js`)

Expose one object on `window.VPC_COMPARISON_DATA`:

| Key | Role |
|-----|------|
| `specRows` | Array of `{ key, label }` — row order in the table |
| `vendors` | Array of vendors, each with `name` and `products[]` |
| `specs` | Object keyed by **product id** → map of spec `key` → string or `null` |

**Vendor** (optional fields):

- `name` — display name (used in dropdown and HDT check).
- `logo` — path to the vendor’s logo image (e.g. `logos/dlx.png`); shown below the dropdown when selected.
- `products` — `{ id, name, type }` where `type` is `shelter` or `connector`.
- `hasInfoPopover`, `infoText` — HDT-only; drives the ⓘ popover when that vendor’s product is selected.

**Product** (optional fields):

- `tested: false` — marks the product as not independently tested by UC Davis. Appends `*` to the dropdown label and shows a footnote below the table.

**Product ids** in `specs` must match `products[].id`. Missing or `null` values render as **TBD** (except bed capacity on connectors → **N/A**).

Vendors in `data.js` are listed alphabetically; products keep the order defined in each vendor’s `products` array.

## Adding or changing data

1. Edit **`data.js` only** for vendors, products, labels, and cell text.
2. Save and **refresh** the browser.
3. Do not change `app.js` unless behavior changes—structure and rendering live there.

When adding a product: add it under the vendor’s `products`, then add a matching key under `specs` with every `specRows` key present (`null` where unknown).

## Branch / history

Active development for the flat-table rebuild may be on branch `rebuild-dropdown-model`. Merge to your default branch when ready.
