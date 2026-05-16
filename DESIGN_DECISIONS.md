# VPC Comparison Tool — Design Decisions

Decisions made during planning that shaped v1. Captured here so the trail is preserved.

1. **Vestibules excluded from v1.** The BLU-MED 7×8 Vestibule and Western Shelter Vestibule (SO-VC8H) don't materially help vendor-to-vendor comparison at the product level.

2. **Calculator is a separate tool.** This tool is comparison-only. No scenario-building, no "how many shelters to get X beds." The 40-bed / 80-bed configuration sections from the source CSV belong to a future calculator tool.

3. **Eyeball-only, no sort/filter.** Values are stored as plain text strings in data.js. The tool never sorts, filters, or computes on values. Vendors state specs in different units (e.g., snow load: "15 PSF" vs "10 lbs/sq ft for 12 hours" vs "3.51 lbs/sq ft STATIC") — those are displayed as-is, not normalized.

4. **3-column structural cap.** Three fixed columns, no add-column button. This solves cap/scroll/bump-vs-remove design questions in one stroke and matches the cognitive limit for side-by-side comparison.

5. **Free product selection.** Any product in any column, including duplicates and same-vendor pairings. Products don't fall into clean size tiers across vendors, so a taxonomy-based selector was rejected.

6. **HDT has no connector entry.** HDT's 8D36 could structurally serve a connector role but is sized as a full shelter and is listed as one. A click-to-open ⓘ popover near HDT in the UI surfaces this in-tool.

7. **Desktop-only target for v1.** No mobile-responsive work. Tablet landscape will work via natural layout.

8. **Hard separation from the VPC Mapping Tool.** Separate repo, separate files, no shared code or data. Shared *facts* (a product's real-world dimensions) are fine — they're just reality.

9. **Bed capacity blank in v1.** All bedCapacity values are null (renders as TBD pill for shelters, N/A for connectors). Will be populated once the team finalizes operational numbers per product.

10. **Dimensions use feet/inches marks.** All External Length × Width values use `'` and `"` marks (e.g., `20' × 32.5'`, `18'7" × 33'11"`). Chosen over worded "ft / in" for compactness and over decimal feet to preserve source fidelity. Tool is faithful to source — no conversions or normalizations.

## Parked / future work

- **Hub-as-usable-space:** DLX's X-Hub and ZUMRO's QUAD could theoretically serve as ancillary space (nurses' station, lab) with spoke doors closed. Not yet represented in the tool.

- **Bed capacity as a range:** Once the team weighs in, may be displayed as "vendor's number – team's operational number" (e.g., "8–10"). Data field absorbs plain text whenever added.

- **Shape icons:** Small generated SVG icon per product representing footprint shape (rect, dome/ellipse, plus, octagon). Deferred. Shape data is known from the mapping tool's verified digest.

- **Hybrid hover/click popover:** Click-only for v1.

- **Flat dropdown alternative:** Current dropdown groups products under vendor optgroup headers. A flat version ("HDT — Base-X 305" as full line items, no grouping) was considered. If the team prefers it after seeing v1, it's a small isolated change in app.js.
