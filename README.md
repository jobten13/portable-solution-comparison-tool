# VPC vendor comparison

Standalone HTML/CSS/JavaScript comparison matrix: open `index.html` in a browser (double-click or via a local static server). No build step or dependencies.

## File roles

| File | Purpose |
|------|---------|
| `index.html` | Page structure and script order |
| `styles.css` | Layout and visual styling |
| `app.js` | Renders the table, filter, and vendor show/hide controls |
| `data.js` | **All vendor and specification content** — edit this when specs change |

## Adding or changing data

Edit **`data.js`** only. It defines a global object `VPC_COMPARISON` with:

- **`meta`** — `title`, optional `subtitle`, optional `footnote` (strings shown in the header/footer).
- **`vendors`** — Array of `{ id, name }`. Each `id` must be unique and stable (use lowercase letters, numbers, hyphens). Column order follows this array.
- **`sections`** — Groups of rows. Each section has `id`, `title`, and `rows`.
- **`rows`** — Each row has `id`, `label`, and `values`.  
  **`values`** is an object whose keys are vendor `id`s and whose values are the cell text (use an em dash or `—` for not applicable if you like).

Example row:

```js
{
  id: 'example-width',
  label: 'Nominal width (ft)',
  values: {
    'blu-med': '24',
    dlx: '21.5',
    western: '—',
  },
  note: 'Optional note shown under the label on wide screens.',
}
```

After saving `data.js`, refresh the browser. Vendor visibility (checkboxes) is remembered for the session in `sessionStorage`.

## Reference behavior

If you have a reference implementation (e.g. `vpc_comparison.html`), place it in this folder or share its markup/behavior so the app can be matched to it.
