/**
 * VPC vendor comparison — data only.
 * Edit this file to add vendors, sections, and specification rows.
 * See README.md for the expected shape of VPC_COMPARISON.
 */
(function () {
  window.VPC_COMPARISON = {
    meta: {
      title: 'VPC vendor comparison',
      subtitle: 'Placeholder data — replace with manufacturer specs in this file only.',
      footnote:
        'Figures are planning placeholders, not certifications. Confirm all values with vendor documentation before procurement.',
    },

    /**
     * Column order follows array order. Each vendor needs a unique `id` (ASCII, no spaces).
     */
    vendors: [
      { id: 'blu-med', name: 'BLU-MED' },
      { id: 'dlx', name: 'DLX' },
      { id: 'western', name: 'Western Shelter' },
      { id: 'zumro', name: 'ZUMRO' },
      { id: 'hdt', name: 'HDT Global' },
    ],

    /**
     * sections[].rows[].values is an object keyed by vendor id.
     * Cell text can be any string. Optional row.note appears below the row on wide screens.
     */
    sections: [
      {
        id: 'general',
        title: 'General',
        rows: [
          {
            id: 'product-families',
            label: 'Product families represented',
            values: {
              'blu-med': 'Medical shelters / deployable facilities',
              dlx: 'Expandable soft-wall & hard-wall',
              western: 'Tensioned fabric & frame systems',
              zumro: 'Air-beam & frame shelters',
              hdt: 'Base-X & containerized systems',
            },
          },
          {
            id: 'data-status',
            label: 'Data status in this tool',
            values: {
              'blu-med': 'Pending',
              dlx: 'Pending',
              western: 'Pending',
              zumro: 'Pending',
              hdt: 'Pending',
            },
            note: 'Update each cell when spec sheets are reviewed.',
          },
        ],
      },
      {
        id: 'dimensions',
        title: 'Dimensions (examples)',
        rows: [
          {
            id: 'ex-width',
            label: 'Example footprint width (ft)',
            values: {
              'blu-med': '—',
              dlx: '—',
              western: '—',
              zumro: '—',
              hdt: '—',
            },
          },
          {
            id: 'ex-length',
            label: 'Example footprint length (ft)',
            values: {
              'blu-med': '—',
              dlx: '—',
              western: '—',
              zumro: '—',
              hdt: '—',
            },
          },
        ],
      },
    ],
  };
})();
