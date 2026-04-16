# VPC vendor comparison

Standalone HTML/CSS/JavaScript tool: open `index.html` in a browser (double-click or a local static server). No build step or dependencies. Uses Google Fonts (DM Sans / DM Mono) from the CDN link in `index.html`.

## File roles

| File | Purpose |
|------|---------|
| `index.html` | Page shell, font link, `styles.css`, then `data.js` → `app.js` |
| `styles.css` | All styling |
| `app.js` | Vendor/spec chips, table render, remove/restore vendor |
| `data.js` | **All vendor rows and cell values** — edit this when specs change |

## Adding or changing data

Edit **`data.js` only.** It assigns `window.VPC_COMPARISON_DATA` with:

- **`vendors`** — `{ id, name, initials }` for each column. `initials` appear in the header badge.
- **`specs`** — Array of specification labels (row order).
- **`values`** — Object keyed by vendor `id`. Each value is an array with **one entry per spec**, in the same order as `specs`. Use `null` or `""` for cells that should show the **TBD** pill; otherwise use a string for the cell text.

When you add a vendor, add a key under `values` with an array of the same length as `specs`. When you add a spec row, append one label to `specs` and append one value to **each** vendor’s array.

Refresh the browser after editing.
