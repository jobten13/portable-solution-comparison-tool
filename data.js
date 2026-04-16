/**
 * VPC vendor comparison — data only.
 * - vendors: columns in the matrix (each needs id, name, initials for the badge).
 * - specs: row labels in order.
 * - values: per-vendor arrays aligned with specs (same index = same row). Use null or "" for TBD.
 */
(function () {
  'use strict';

  var SPECS = [
    'External dimensions (L × W × H)',
    'Interior floor space',
    'Wind resistance rating',
    'Snow load',
    'Fire resistance rating',
    'Setup time & personnel required',
    'Recommended ground surface',
    'Expected lifespan',
    'Repair expectations & procedures',
  ];

  var VENDORS = [
    { id: 'blu-med', name: 'BLU-MED', initials: 'BM' },
    { id: 'dlx', name: 'DLX', initials: 'DX' },
    { id: 'hdt', name: 'HDT', initials: 'HD' },
    { id: 'western', name: 'Western Shelter', initials: 'WS' },
    { id: 'zumro', name: 'ZUMRO', initials: 'ZU' },
  ];

  // Each array index matches SPECS (same order). Replace null with cell text as data is confirmed.
  var values = {
    'blu-med': [
      null, // External dimensions (L × W × H)
      null, // Interior floor space
      null, // Wind resistance rating
      null, // Snow load
      null, // Fire resistance rating
      null, // Setup time & personnel required
      null, // Recommended ground surface
      null, // Expected lifespan
      null, // Repair expectations & procedures
    ],
    dlx: [
      null, // External dimensions (L × W × H)
      null, // Interior floor space
      null, // Wind resistance rating
      null, // Snow load
      null, // Fire resistance rating
      null, // Setup time & personnel required
      null, // Recommended ground surface
      null, // Expected lifespan
      null, // Repair expectations & procedures
    ],
    hdt: [
      null, // External dimensions (L × W × H)
      null, // Interior floor space
      null, // Wind resistance rating
      null, // Snow load
      null, // Fire resistance rating
      null, // Setup time & personnel required
      null, // Recommended ground surface
      null, // Expected lifespan
      null, // Repair expectations & procedures
    ],
    western: [
      null, // External dimensions (L × W × H)
      null, // Interior floor space
      null, // Wind resistance rating
      null, // Snow load
      null, // Fire resistance rating
      null, // Setup time & personnel required
      null, // Recommended ground surface
      null, // Expected lifespan
      null, // Repair expectations & procedures
    ],
    zumro: [
      null, // External dimensions (L × W × H)
      null, // Interior floor space
      null, // Wind resistance rating
      null, // Snow load
      null, // Fire resistance rating
      null, // Setup time & personnel required
      null, // Recommended ground surface
      null, // Expected lifespan
      null, // Repair expectations & procedures
    ],
  };

  window.VPC_COMPARISON_DATA = {
    vendors: VENDORS,
    specs: SPECS,
    values: values,
  };
})();
