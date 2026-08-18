# Portable Solution Comparison Tool — Design Decisions

Decisions made during planning that shaped the tool. Captured here so the trail is preserved.

1. **Vestibules excluded from v1.** The BLU-MED 7×8 Vestibule and Western Shelter Vestibule (SO-VC8H) don't materially help vendor-to-vendor comparison at the product level.

2. **Calculator is a separate tool.** This tool is comparison-only. No scenario-building, no "how many shelters to get X beds." The 40-bed / 80-bed configuration sections from the source CSV belong to a future calculator tool.

3. **Display strings as-is; structured filtering added later.** Spec display values in `data.js` remain plain text strings shown without unit conversion (e.g., snow load: "15 PSF" vs "10 lbs/sq ft for 12 hours"). Filtering uses a separate hand-authored `filter` object per product; the match engine computes against those structured values. There is still no column sorting.

4. **5-column structural cap.** Five fixed product columns, no add-column button. This solves cap/scroll/bump-vs-remove design questions in one stroke.

5. **Free product selection.** Any product in any column, including duplicates and same-vendor pairings. Products don't fall into clean size tiers across vendors, so a taxonomy-based selector was rejected.

6. **HDT has no connector entry.** HDT's 8D36 could structurally serve a connector role but is sized as a full shelter and is listed as one. Its `infoText` drives a click-to-open ⓘ popover when that product is selected (the popover is general—any product with `infoText` can use it).

7. **Desktop-only target for v1.** No mobile-responsive work. Tablet landscape will work via natural layout.

8. **Hard separation from the Portable Solution Site Mapping Tool.** Separate repo, separate files, no shared code or data. Shared *facts* (a product's real-world dimensions) are fine — they're just reality.

9. **Bed capacity populated in v1.** All bedCapacity values are now populated strings. Shelter products show a numeric value or range; connector products with null bedCapacity render as N/A via the type-based rule. GK-20 is typed as a shelter but its bedCapacity is set to the string "N/A" because it serves an ancillary/connector role rather than patient care.

10. **External Footprint in square feet.** The external-dimensions row is labeled **External Footprint** and stores sq ft display strings (often with a parenthetical L×W or shape note). Internal Floorspace uses sq ft similarly. Display strings are faithful to source wording; filter values are authored separately (see item 12).

11. **Untested products marked with asterisk.** Products not independently tested by UC Davis during IMPACTS project events or exercises set `tested: false` on the catalogue entry. They display an asterisk (*) after their name in the dropdown. When any selected column is untested, a sticky banner in the table header explains the mark (plural wording). There is no header `*` chip and no bottom footnote. Originally applied to four DLX products (ASAP18, X-16, X-24SC, X-40); later extended to DLX X-8 and all hard-sided Portable Solution Catalog additions (Craftsmen, FORTS, WILSCOT). This convention should apply to any future untested products from any vendor. (Narrowed by item 25 — most untested products are now hidden from the picker except hard-sided vendors.)

12. **Per-field filter direction.** Bed Capacity and Internal Floorspace filter as **minimums** (product must meet or exceed the threshold). External Footprint filters as a **maximum** ("what fits in my space"—product footprint must be at or below the threshold). Direction is data-driven via `FILTER_FIELD_DEFS` in `app.js` so each field's rule is declared in one place.

13. **Hand-authored filter values, separate from display.** Each `specs` entry includes a `filter: { bedCapacity, extSqFt, intSqFt }` object with structured numbers (or `{ min, max }` / `{ excluded: true }`). These are written by hand in `data.js`—not parsed from display strings at runtime. Authoring rule: strip `~` from display, take the leading sq ft for sq-ft fields; bed ranges use `{ min, max }`; no usable number → `{ excluded: true }`.

14. **Column grey-out on filter mismatch.** When filters are active, a column whose selected product no longer matches greys its header and cells but **never** has its selection cleared. Greying clears when the product conforms again, the user clears the column, or the last active filter is removed. The ⓘ info popover stays live on greyed columns.

15. **Filter bounds and range tolerance.** `computeFilterBounds` expands `{ min, max }` range values uniformly for all three filter fields when setting input min/max guardrails. Only Bed Capacity has ranges in current data; sq-ft range tolerance is implemented but unexercised until a product's `filter.extSqFt` or `filter.intSqFt` uses a range.

16. **External footprint rounding: ceiling to whole feet.** For rectangular external footprints, each raw dimension is rounded **up** to the next whole foot (any fractional foot rounds up; an exact whole foot stays). Sq ft = rounded length × rounded width. Rationale: External Footprint answers "will this fit in my space," so the value must never understate size. Applies to all future rectangular product additions. Earlier data used half-up for two products; corrected to ceiling in commit `9dcff95` (`dlx-x24sc`, `zumro-600`). Irregular (`~`) footprints use vendor-stated envelope values with shape notes, not L×W rectangles. WILSCOT Patient/Staff unit widths (24' / 12') are this ceiling applied to catalogue Redi-Plex / Standard figures (23'6" / 11'9"), not a conflicting data source.

17. **Hard-sided vendors as separate optgroups.** Craftsmen, FORTS, and WILSCOT are each their own vendor `<optgroup>` (not one combined “hard-sided” group), after the soft-sided vendors. A non-selectable disabled `<option>` labeled “— Hard-sided —” is inserted before the first vendor with `structure: 'hard-sided'`. Native `<select>` cannot nest section headers inside optgroups.

18. **FORTS Model 38 is the base unit, not the catalogue assembly.** The tool lists a single Model 38 building block. Catalogue “6-Bed ICU / 10-Bed Med Surg” specs for the full multi-unit assembly are not used for exterior/interior size or setup. Assembly-scale quantities (setup 24 hr / 8 personnel, fire-detection counts, utilities, anchor counts) are omitted; ratings (wind, snow, fire class, lifespan, ground) may be carried. Setup displays “Contact vendor” with ⓘ `infoText` directing users to the vendor for configuration-specific setup time.

19. **Derived / nominal values use tilde + ⓘ when needed, not a new UI marker.** There is no separate “derived vs vendor-confirmed” flag beyond display. FORTS bed capacity `~2 to 3` is diagram-derived from uneven per-unit bed icons in the assembly drawing (not vendor-stated per Model 38) and stands with the tilde alone. WILSCOT per-unit `intDims` use a leading `~` because the Portable Solution Catalog only stated a combined interior total; provenance is explained via `infoText` / ⓘ. Untested (`tested: false` / dropdown `*` + header banner) remains a separate concern.

20. **Standing PSC vs vendor-sheet sourcing.** For product additions: **dimensions** (exterior footprint / interior floorspace) come from the individual vendor spec sheet or dimensioned diagram when one exists; **all other** comparison-row specs (wind, snow, fire, setup, ground, lifespan, repair) come from the Portable Solution Catalog (PSC) summary for that vendor. If no individual sheet/diagram exists, PSC supplies dimensions too—flag that explicitly in docs for the affected products. Where PSC and an individual source **genuinely conflict** on an overlapping non-dimension field, **use the PSC value for now** and list the conflict under vendor verification; do not silently prefer the sheet for those fields.

21. **Western Shelter / ZUMRO shape families (2026 additions).** GateKeeper 2342 and 2360 are clipped-corner rectangles like GK-1935: exterior uses `~N sq ft (Clipped-corner rectangle)` from the ceiling-rounded bounding box; interior uses the vendor sheet’s Square Footage with no tilde. Guardian 2032 and 3065 are Quonset/arched (BLU-MED XPH family): plain ceiling-rounded rectangle exterior, no tilde; **PSC-only** for both dimensions and specs until individual sheets exist (no per-product `infoText`). GK-20 (octagon) is unchanged. ZUMRO Model 900 exterior uses diagram width `32'9"` (PSC `32.9"` treated as a typo). External Airlock is a `connector` (`bedCapacity: null`).

22. **HDT 3236A Airbeam tapered-end footprint.** Exterior uses `~N sq ft (Tapered-end rectangle)` from the ceiling-rounded diagram bounding box on `HDT_32SeriesAirBeam_17.pdf` (77'4" × 34'5" → 78' × 35' → 2730 sq ft)—same tilde + shape-note pattern as clipped-corner GateKeepers, without embedded L×W. Interior uses the vendor-stated Type A with-liner **Total useable area** `1422 sq ft` (no tilde). PSC’s `32' × 36' / 1400 sq ft` interior is superseded by the individual sheet for dimensions. Display name follows PSC literal “3236A Airbeam”; id `hdt-3236a`.

23. **ZUMRO External Airlock dimensions — mixed confirmation / open anomaly.** `zumro-airlock` currently uses `intDims` `59 sq ft` (filter `intSqFt: 59`) and `extDims` `88 sq ft (8' × 11')` (filter `extSqFt: 88`). **Interior is vendor-confirmed** via an individual spec sheet (`5'6" × 10'8"`). **Exterior is not vendor-confirmed:** `88 sq ft (8' × 11')` is an older figure from an earlier product diagram (ceiling-rounded from `128"×86"`); the vendor did not provide exterior dimensions, and **no further vendor contact will be made** on this item. The vendor also stated that PSC’s own interior `10x10` figure is **incorrect** and needs correction on their end—flag this for the eventual PSC-owner review list. **Ratio anomaly (unresolved):** every other ZUMRO product in `data.js` has an interior/exterior square-footage ratio of roughly 90–95% (e.g. `zumro-400` ~95%, `zumro-900` ~91%, `zumro-216` 90%). Airlock’s current figures (`59`/`88`) yield ~**67%**, well outside that pattern, which suggests the `88 sq ft` exterior may itself be inaccurate—but this cannot be resolved without further vendor input, which will not be pursued further at this time. Documented as an open, unresolved anomaly—not something to silently “correct.”

24. **Product display naming and ordering conventions.** Product display names lead with the model or family name, followed by the number (for example, `Base-X 305`, `GateKeeper 2342`, `Airbeam 3236A`, and `XPH 2032.5`). Commit `ff38a22` standardized this convention across vendors, including expanding abbreviated family names (`GK-20` → `GateKeeper 20`). Internal ids such as `ws-gk20` were deliberately left unchanged for code stability; display names and ids may differ, and that is intentional. Within each vendor’s `products` array, products are grouped by model family; families sort alphabetically by family name, and products within a family sort by ascending model number as a size proxy. Numberless standalone connectors/interfaces (`X-Hub`, `QUAD Interface`) sort last within their vendor because they have no model number. **External Airlock** (formerly `External Airlock Shelter System`) is treated as a normal named product for ordering—not as part of the numberless-connector-last exception—even though it physically functions as an entryway/vestibule and retains its `connector` data type. It has a sortable name and is treated as an occupiable/named unit, so it sorts alphabetically under E before ZUMRO’s `Model` family; this distinguishes it from `QUAD Interface` and `X-Hub`.

25. **Hide untested products from the picker, except hard-sided vendors.** Item 11 still governs the `*` mark and banner for any untested product that is selectable. A later display-only rule narrows the picker: `tested: false` products are omitted from the dropdown unless their vendor has `structure: 'hard-sided'` (Craftsmen, FORTS, WILSCOT). There is no connector exception — ZUMRO External Airlock is hidden with the other non-hard-sided untested products. Entries remain in `data.js` unchanged. Filter input min/max guardrails (`computeFilterBounds`) consider only picker-visible products so a threshold cannot be set that only a hidden product would satisfy. The untested banner wording is unchanged. The app has no saved comparison state, so a column cannot load with a since-hidden product already selected.

## Vendor verification backlog

Unresolved PSC ↔ individual-source conflicts / anomalies. The vendor has responded to the items below; the tool continues to use PSC values under the standing sourcing rule, and the PSC holder—copied on the vendor correspondence—owns any PSC correction:

1. **Quick Halt setup — OPEN:** PSC `90 seconds, 2 people`; `HDT_Quick-Halt_TAC_Shelter_08.pdf` Set-up `2–5 minutes` (402) / `3–6 minutes` (403), 2 personnel. Vendor clarified that PSC’s `90 seconds` covers only raising the shelter, with a few additional minutes required to stake it—consistent with the individual-sheet figures. Per the standing rule, the tool keeps the PSC value; the PSC holder owns any PSC correction. Tool value unchanged.
2. **3236A Airbeam setup — OPEN:** PSC `40 min with 8 people`; `HDT_32SeriesAirBeam_17.pdf` Set-Up `30 – 40 minutes` / `6 each`. Vendor clarified that the individual sheet’s `6 personnel` is a military-crew figure; realistically, 8 people minimum and up to 12 are needed to achieve setup in under 40 minutes, supporting PSC’s stated `8 people`. Per the standing rule, the tool keeps the PSC value; the PSC holder owns any PSC correction. Tool value unchanged.

## Resolved vendor confirmations

1. **Quick Halt bed capacity — RESOLVED:** Vendor confirmed per-model capacity: Quick Halt 402 is `2–3` beds and Quick Halt 403 is `4–5` beds. Applied to `data.js` display and filter values.

## Parked / future work

- **Hub-as-usable-space:** DLX's X-Hub and ZUMRO's QUAD could theoretically serve as ancillary space (nurses' station, lab) with spoke doors closed. Not yet represented in the tool.

- **Bed capacity as a range:** Once the team weighs in, may be displayed as "vendor's number – team's operational number" (e.g., "8–10"). Data field absorbs plain text whenever added.

- **Shape icons:** Small generated SVG icon per product representing footprint shape (rect, dome/ellipse, plus, octagon). Deferred. Shape data is known from the mapping tool's verified digest.

- **Hybrid hover/click popover:** Click-only for v1.

- **Vendor optgroups in dropdown:** Product picker groups options under vendor `<optgroup>` headers; option text is the product name (plus ` *` if untested). A prior flat "Vendor — Product" prefix layout was superseded.

- **QUICKSTART.pdf / in-tool help:** `QUICKSTART.pdf` regeneration is deferred after v2 doc updates; an in-tool help view may replace the PDF for day-to-day use.
