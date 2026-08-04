# Portable Solution Comparison Tool — Design Decisions

Decisions made during planning that shaped the tool. Captured here so the trail is preserved.

1. **Vestibules excluded from v1.** The BLU-MED 7×8 Vestibule and Western Shelter Vestibule (SO-VC8H) don't materially help vendor-to-vendor comparison at the product level.

2. **Calculator is a separate tool.** This tool is comparison-only. No scenario-building, no "how many shelters to get X beds." The 40-bed / 80-bed configuration sections from the source CSV belong to a future calculator tool.

3. **Display strings as-is; structured filtering added later.** Spec display values in `data.js` remain plain text strings shown without unit conversion (e.g., snow load: "15 PSF" vs "10 lbs/sq ft for 12 hours"). Filtering uses a separate hand-authored `filter` object per product; the match engine computes against those structured values. There is still no column sorting.

4. **5-column structural cap.** Five fixed product columns, no add-column button. This solves cap/scroll/bump-vs-remove design questions in one stroke.

5. **Free product selection.** Any product in any column, including duplicates and same-vendor pairings. Products don't fall into clean size tiers across vendors, so a taxonomy-based selector was rejected.

6. **HDT has no connector entry.** HDT's 8D36 could structurally serve a connector role but is sized as a full shelter and is listed as one. Its `infoText` drives a click-to-open ⓘ popover when that product is selected (the popover is general—any product with `infoText` can use it).

7. **Desktop-only target for v1.** No mobile-responsive work. Tablet landscape will work via natural layout.

8. **Hard separation from the VPC Mapping Tool.** Separate repo, separate files, no shared code or data. Shared *facts* (a product's real-world dimensions) are fine — they're just reality.

9. **Bed capacity populated in v1.** All bedCapacity values are now populated strings. Shelter products show a numeric value or range; connector products with null bedCapacity render as N/A via the type-based rule. GK-20 is typed as a shelter but its bedCapacity is set to the string "N/A" because it serves an ancillary/connector role rather than patient care.

10. **External Footprint in square feet.** The external-dimensions row is labeled **External Footprint** and stores sq ft display strings (often with a parenthetical L×W or shape note). Internal Floorspace uses sq ft similarly. Display strings are faithful to source wording; filter values are authored separately (see item 12).

11. **Untested products marked with asterisk.** Products not independently tested by UC Davis during IMPACTS project events or exercises set `tested: false` on the catalogue entry. They display an asterisk (*) after their name in the dropdown. When any selected column is untested, a sticky banner in the table header explains the mark (plural wording). There is no header `*` chip and no bottom footnote. Originally applied to four DLX products (ASAP18, X-16, X-24SC, X-40); later extended to DLX X-8 and all hard-sided Portable Solution Catalogue additions (Craftsmen, FORTS, WILSCOT). This convention should apply to any future untested products from any vendor.

12. **Per-field filter direction.** Bed Capacity and Internal Floorspace filter as **minimums** (product must meet or exceed the threshold). External Footprint filters as a **maximum** ("what fits in my space"—product footprint must be at or below the threshold). Direction is data-driven via `FILTER_FIELD_DEFS` in `app.js` so each field's rule is declared in one place.

13. **Hand-authored filter values, separate from display.** Each `specs` entry includes a `filter: { bedCapacity, extSqFt, intSqFt }` object with structured numbers (or `{ min, max }` / `{ excluded: true }`). These are written by hand in `data.js`—not parsed from display strings at runtime. Authoring rule: strip `~` from display, take the leading sq ft for sq-ft fields; bed ranges use `{ min, max }`; no usable number → `{ excluded: true }`.

14. **Column grey-out on filter mismatch.** When filters are active, a column whose selected product no longer matches greys its header and cells but **never** has its selection cleared. Greying clears when the product conforms again, the user clears the column, or the last active filter is removed. The ⓘ info popover stays live on greyed columns.

15. **Filter bounds and range tolerance.** `computeFilterBounds` expands `{ min, max }` range values uniformly for all three filter fields when setting input min/max guardrails. Only Bed Capacity has ranges in current data; sq-ft range tolerance is implemented but unexercised until a product's `filter.extSqFt` or `filter.intSqFt` uses a range.

16. **External footprint rounding: ceiling to whole feet.** For rectangular external footprints, each raw dimension is rounded **up** to the next whole foot (any fractional foot rounds up; an exact whole foot stays). Sq ft = rounded length × rounded width. Rationale: External Footprint answers "will this fit in my space," so the value must never understate size. Applies to all future rectangular product additions. Earlier data used half-up for two products; corrected to ceiling in commit `9dcff95` (`dlx-x24sc`, `zumro-600`). Irregular (`~`) footprints use vendor-stated envelope values with shape notes, not L×W rectangles. WILSCOT Patient/Staff unit widths (24' / 12') are this ceiling applied to catalogue Redi-Plex / Standard figures (23'6" / 11'9"), not a conflicting data source.

17. **Hard-sided vendors as separate optgroups.** Craftsmen, FORTS, and WILSCOT are each their own vendor `<optgroup>` (not one combined “hard-sided” group), after the soft-sided vendors. A non-selectable disabled `<option>` labeled “— Hard-sided —” is inserted before the first vendor with `structure: 'hard-sided'`. Native `<select>` cannot nest section headers inside optgroups.

18. **FORTS Model 38 is the base unit, not the catalogue assembly.** The tool lists a single Model 38 building block. Catalogue “6-Bed ICU / 10-Bed Med Surg” specs for the full multi-unit assembly are not used for exterior/interior size or setup. Assembly-scale quantities (setup 24 hr / 8 personnel, fire-detection counts, utilities, anchor counts) are omitted; ratings (wind, snow, fire class, lifespan, ground) may be carried. Setup displays “Contact vendor” with ⓘ `infoText` directing users to the vendor for configuration-specific setup time.

19. **Derived / nominal values use tilde + ⓘ when needed, not a new UI marker.** There is no separate “derived vs vendor-confirmed” flag beyond display. FORTS bed capacity `~2 to 3` is diagram-derived from uneven per-unit bed icons in the assembly drawing (not vendor-stated per Model 38) and stands with the tilde alone. WILSCOT per-unit `intDims` use a leading `~` because the Portable Solution Catalogue only stated a combined interior total; provenance is explained via `infoText` / ⓘ. Untested (`tested: false` / dropdown `*` + header banner) remains a separate concern.

## Parked / future work

- **Hub-as-usable-space:** DLX's X-Hub and ZUMRO's QUAD could theoretically serve as ancillary space (nurses' station, lab) with spoke doors closed. Not yet represented in the tool.

- **Bed capacity as a range:** Once the team weighs in, may be displayed as "vendor's number – team's operational number" (e.g., "8–10"). Data field absorbs plain text whenever added.

- **Shape icons:** Small generated SVG icon per product representing footprint shape (rect, dome/ellipse, plus, octagon). Deferred. Shape data is known from the mapping tool's verified digest.

- **Hybrid hover/click popover:** Click-only for v1.

- **Vendor optgroups in dropdown:** Product picker groups options under vendor `<optgroup>` headers; option text is the product name (plus ` *` if untested). A prior flat "Vendor — Product" prefix layout was superseded.

- **QUICKSTART.pdf / in-tool help:** `QUICKSTART.pdf` regeneration is deferred after v2 doc updates; an in-tool help view may replace the PDF for day-to-day use.
