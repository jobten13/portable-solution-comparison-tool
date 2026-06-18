# Portable Solution Comparison Tool — Design Decisions

Decisions made during planning that shaped v1. Captured here so the trail is preserved.

1. **Vestibules excluded from v1.** The BLU-MED 7×8 Vestibule and Western Shelter Vestibule (SO-VC8H) don't materially help vendor-to-vendor comparison at the product level.

2. **Calculator is a separate tool.** This tool is comparison-only. No scenario-building, no "how many shelters to get X beds." The 40-bed / 80-bed configuration sections from the source CSV belong to a future calculator tool.

3. **Eyeball-only, no sort/filter.** Values are stored as plain text strings in data.js. The tool never sorts, filters, or computes on values. Vendors state specs in different units (e.g., snow load: "15 PSF" vs "10 lbs/sq ft for 12 hours" vs "3.51 lbs/sq ft STATIC") — those are displayed as-is, not normalized.

4. **3-column structural cap.** Three fixed columns, no add-column button. This solves cap/scroll/bump-vs-remove design questions in one stroke and matches the cognitive limit for side-by-side comparison.

5. **Free product selection.** Any product in any column, including duplicates and same-vendor pairings. Products don't fall into clean size tiers across vendors, so a taxonomy-based selector was rejected.

6. **HDT has no connector entry.** HDT's 8D36 could structurally serve a connector role but is sized as a full shelter and is listed as one. A click-to-open ⓘ popover near HDT in the UI surfaces this in-tool.

7. **Desktop-only target for v1.** No mobile-responsive work. Tablet landscape will work via natural layout.

8. **Hard separation from the VPC Mapping Tool.** Separate repo, separate files, no shared code or data. Shared *facts* (a product's real-world dimensions) are fine — they're just reality.

9. **Bed capacity populated in v1.** All bedCapacity values are now populated strings. Shelter products show a numeric value or range; connector products with null bedCapacity render as N/A via the type-based rule. GK-20 is typed as a shelter but its bedCapacity is set to the string "N/A" because it serves an ancillary/connector role rather than patient care.

10. **Dimensions use feet/inches marks.** All External Length × Width values use `'` and `"` marks (e.g., `20' × 32.5'`, `18'7" × 33'11"`). Chosen over worded "ft / in" for compactness and over decimal feet to preserve source fidelity. Tool is faithful to source — no conversions or normalizations.

11. **Untested products marked with asterisk.** Four DLX products (ASAP18, X-16, X-24SC, X-40) were added to the tool from the Vendor Product Catalog but were not independently tested by UC Davis during IMPACTS project events or exercises. These products display an asterisk (*) after their name in the dropdown and a contextual footnote appears below the table only when one of these products is selected. This convention should apply to any future untested products from any vendor.

## Parked / future work

- **Hub-as-usable-space:** DLX's X-Hub and ZUMRO's QUAD could theoretically serve as ancillary space (nurses' station, lab) with spoke doors closed. Not yet represented in the tool.

- **Bed capacity as a range:** Once the team weighs in, may be displayed as "vendor's number – team's operational number" (e.g., "8–10"). Data field absorbs plain text whenever added.

- **Shape icons:** Small generated SVG icon per product representing footprint shape (rect, dome/ellipse, plus, octagon). Deferred. Shape data is known from the mapping tool's verified digest.

- **Hybrid hover/click popover:** Click-only for v1.

- **Flat dropdown (adopted in v1):** Product picker uses a flat "Vendor — Product" list; optgroup headers were removed in favor of prefix-based grouping in the option text.
