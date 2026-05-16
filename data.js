/**
 * VPC Comparison Tool — data only.
 * Exposes window.VPC_COMPARISON_DATA. Edit this file for routine data updates.
 */
(function () {
  'use strict';

  window.VPC_COMPARISON_DATA = {
    specRows: [
      { key: 'bedCapacity', label: 'Bed Capacity' },
      { key: 'extDims', label: 'External Length × Width' },
      { key: 'intDims', label: 'Interior floor space dimensions' },
      { key: 'wind', label: 'Wind resistance rating' },
      { key: 'snow', label: 'Snow load' },
      { key: 'fire', label: 'Fire Resistance Rating' },
      { key: 'setup', label: 'Setup time & number of personnel required' },
      { key: 'ground', label: 'Recommended ground surface' },
      { key: 'lifespan', label: 'Expected lifespan' },
      { key: 'repair', label: 'Repair expectations & procedures' },
    ],
    vendors: [
      {
        name: 'BLU-MED',
        products: [
          { id: 'blumed-2032', name: '2032.5 XPH', type: 'shelter' },
          { id: 'blumed-2039', name: '2039 XPH', type: 'shelter' },
        ],
      },
      {
        name: 'DLX',
        products: [
          { id: 'dlx-x24', name: 'X-24', type: 'shelter' },
          { id: 'dlx-x32', name: 'X-32', type: 'shelter' },
          { id: 'dlx-xhub', name: 'X-Hub', type: 'connector' },
        ],
      },
      {
        name: 'HDT',
        hasInfoPopover: true,
        infoText:
          'HDT does not produce a small connector. The 8D36 can serve a connector role, but is sized as a full shelter and is listed as such.',
        products: [
          { id: 'hdt-305', name: 'Base-X 305', type: 'shelter' },
          { id: 'hdt-8d36', name: 'Base-X 8D36', type: 'shelter' },
        ],
      },
      {
        name: 'Western Shelter',
        products: [
          { id: 'ws-gk20', name: 'GK-20', type: 'shelter' },
          { id: 'ws-gk1935', name: 'GK-1935', type: 'shelter' },
        ],
      },
      {
        name: 'ZUMRO',
        products: [
          { id: 'zumro-400', name: 'Model 400', type: 'shelter' },
          { id: 'zumro-600', name: 'Model 600', type: 'shelter' },
          { id: 'zumro-quad', name: 'QUAD Interface', type: 'connector' },
        ],
      },
    ],
    specs: {
      'blumed-2032': {
        bedCapacity: null,
        extDims: "20' × 32.5'",
        intDims: "20' × 32.5'",
        wind: '80 MPH Sustained, 100 MPH Gusts',
        snow: '15 lb. per sq ft (PSF)',
        fire: 'NFPA 701',
        setup: '30 minutes with 6 trained personnel',
        ground: 'Cement, Asphalt, Dirt',
        lifespan:
          'BLU-MED structures are designed and provide for extended erection of 10 years with a shelf life of 20 years',
        repair:
          '100 Setup/Strike Cycles – No System Failure. Each shelter includes (1) repair kit.',
      },
      'blumed-2039': {
        bedCapacity: null,
        extDims: "39' × 20'",
        intDims: "39' × 20'",
        wind: '80 MPH Sustained, 100 MPH Gusts',
        snow: '15 lb. per sq ft (PSF)',
        fire: 'NFPA 701',
        setup: '30 minutes with 6 trained personnel',
        ground: 'Cement, Asphalt, Dirt',
        lifespan:
          'BLU-MED structures are designed and provide for extended erection of 10 years with a shelf life of 20 years',
        repair:
          '100 Setup/Strike Cycles – No System Failure. Each shelter includes (1) repair kit.',
      },
      'dlx-x24': {
        bedCapacity: null,
        extDims: "24' × 21.5'",
        intDims: '516 ft²',
        wind: '65 mph sustained, 75 mph gusts',
        snow: '10 lbs/sq ft',
        fire: 'NFPA 701',
        setup: '4 person; 15 minutes under canopy, 30 minutes full setup',
        ground: 'Flat, dry ground, asphalt, or concrete.',
        lifespan: '10 years if properly maintained',
        repair: 'Vinyl repairs may be needed if damaged during use. Repair kit included.',
      },
      'dlx-x32': {
        bedCapacity: null,
        extDims: "32' × 21.5'",
        intDims: '688 ft²',
        wind: '65 mph sustained, 75 mph gusts',
        snow: '10 lbs/sq ft',
        fire: 'NFPA 701',
        setup: '5 person; 15 minutes under canopy, 30 minutes full setup',
        ground: 'Flat, dry ground, asphalt, or concrete.',
        lifespan: '10 years if properly maintained',
        repair: 'Vinyl repairs may be needed if damaged during use. Repair kit included.',
      },
      'dlx-xhub': {
        bedCapacity: null,
        extDims: null,
        intDims: null,
        wind: null,
        snow: null,
        fire: null,
        setup: null,
        ground: null,
        lifespan: null,
        repair: null,
      },
      'hdt-305': {
        bedCapacity: null,
        extDims: "18' × 25'",
        intDims: '450 sq ft',
        wind: '55 mph constant and 65 mph gusts',
        snow: '10 lbs per sq ft',
        fire: 'CSFM 13115 Flame Retardant Fabric Registration',
        setup: '12 min with 4 people',
        ground:
          'Hard packed level ground with good drainage is preferred. Can also be setup on asphalt or concrete with add on hard surface anchoring system.',
        lifespan: '10+ years',
        repair:
          'Each shelter comes with repair kit for typical field repairs. Parts can be ordered as needed.',
      },
      'hdt-8d36': {
        bedCapacity: null,
        extDims: "31' × 37'",
        intDims: '935 sq ft',
        wind: '55 mph constant and 65 mph gusts',
        snow: '10 lbs per sq ft',
        fire: 'CSFM 13115 Flame Retardant Fabric Registration',
        setup: '20 min with 8 people',
        ground:
          'Hard packed level ground with good drainage is preferred. Can also be setup on asphalt or concrete with add on hard surface anchoring system.',
        lifespan: '10+ years with proper care & maintenance',
        repair:
          'Each shelter comes with repair kit for typical field repairs. Parts can be ordered as needed.',
      },
      'ws-gk20': {
        bedCapacity: null,
        extDims: '18\'7" × 18\'7"',
        intDims: '18\'7" Octagon',
        wind: '55 mph constant and 65 mph gusts',
        snow: '10 lbs/sq ft for 12 hours',
        fire: 'NFPA 701',
        setup: '45 min w/ 6 people per shelter',
        ground: 'Hard & level (concrete, grass, dirt)',
        lifespan: '10+ years with proper care & maintenance',
        repair:
          'Yearly inspection & maintenance – parts can be ordered individually as needed.',
      },
      'ws-gk1935': {
        bedCapacity: null,
        extDims: '18\'7" × 33\'11"',
        intDims: '18\'7" × 33\'11"',
        wind: '55 mph w/ gusts to 65 mph',
        snow: '10 lbs/sq ft for 12 hours',
        fire: 'NFPA 701',
        setup: '45 min w/ 12 people per shelter',
        ground: 'Hard & level (concrete, grass, dirt)',
        lifespan: '10+ years with proper care & maintenance',
        repair:
          'Yearly inspection & maintenance – parts can be ordered individually as needed.',
      },
      'zumro-400': {
        bedCapacity: null,
        extDims: "21' × 20'",
        intDims: '400 sq ft',
        wind: '55 MPH',
        snow: '3.51 lbs. per square foot STATIC load',
        fire: 'NFPA 701',
        setup: '5 minutes with 2 personnel',
        ground: 'Hard & Level Preferred',
        lifespan: '15+ years with proper maintenance & care',
        repair: 'Annual Inspections & Maintenance as needed',
      },
      'zumro-600': {
        bedCapacity: null,
        extDims: '31\' × 20\'4"',
        intDims: '600 sq ft',
        wind: '55 MPH',
        snow: '3.29 lbs. per square foot STATIC load',
        fire: 'NFPA 701',
        setup: '5–7 minutes with 2 personnel',
        ground: 'Hard & Level Preferred',
        lifespan: '15+ years with proper maintenance & care',
        repair: 'Annual Inspections & Maintenance as needed',
      },
      'zumro-quad': {
        bedCapacity: null,
        extDims: '19\'5" × 29\'4" / 14\'9"',
        intDims: '454 sq ft',
        wind: '55 MPH',
        snow: '3.44 lbs. per square foot STATIC load',
        fire: 'NFPA 701',
        setup: '5–7 minutes with 2 personnel',
        ground: null,
        lifespan: null,
        repair: null,
      },
    },
  };
})();
