(function () {
  'use strict';

  /* Set by initBuildList; Compare calls this to add without reading Build List state.
     Returns the new quantity (number) on success, or null on failure. */
  var buildListQuickAdd = null;

  function productInfoText(product) {
    if (
      product &&
      typeof product.infoText === 'string' &&
      product.infoText.length > 0
    ) {
      return product.infoText;
    }
    return null;
  }

  function findProductContext(data, productId) {
    if (!productId) return null;
    for (var i = 0; i < data.vendors.length; i++) {
      var vendor = data.vendors[i];
      for (var j = 0; j < vendor.products.length; j++) {
        var product = vendor.products[j];
        if (product.id === productId) {
          return { vendor: vendor, product: product };
        }
      }
    }
    return null;
  }

  function isProductInPicker(vendor, product) {
    if (product.tested === false && vendor.structure !== 'hard-sided') {
      return false;
    }
    return true;
  }

  var FILTER_FIELD_DEFS = [
    { key: 'bedCapacity', direction: 'min' },
    { key: 'intSqFt', direction: 'min' },
    { key: 'extSqFt', direction: 'max' },
  ];

  var FILTER_FIELD_KEYS = FILTER_FIELD_DEFS.map(function (d) {
    return d.key;
  });

  var FILTER_FIELD_DIRECTION = {};
  FILTER_FIELD_DEFS.forEach(function (d) {
    FILTER_FIELD_DIRECTION[d.key] = d.direction;
  });

  function getFilterFieldDirection(fieldKey) {
    return FILTER_FIELD_DIRECTION[fieldKey] || 'min';
  }

  function isFilterFieldExcluded(val) {
    return !!(val && val.excluded === true);
  }

  function fieldPassesThreshold(filterVal, threshold, direction) {
    if (threshold === null || threshold === undefined || threshold === '') {
      return true;
    }
    if (isFilterFieldExcluded(filterVal)) {
      return false;
    }
    var isMax = direction === 'max';
    if (typeof filterVal === 'number') {
      return isMax ? filterVal <= threshold : filterVal >= threshold;
    }
    if (
      filterVal &&
      typeof filterVal.min === 'number' &&
      typeof filterVal.max === 'number'
    ) {
      return isMax
        ? filterVal.max <= threshold
        : filterVal.max >= threshold;
    }
    return false;
  }

  function productMatchesFilters(productId, data, thresholds) {
    var spec = data.specs[productId];
    if (!spec || !spec.filter) {
      return false;
    }
    var filter = spec.filter;
    var i;
    for (i = 0; i < FILTER_FIELD_KEYS.length; i++) {
      var key = FILTER_FIELD_KEYS[i];
      if (
        !fieldPassesThreshold(
          filter[key],
          thresholds[key],
          getFilterFieldDirection(key)
        )
      ) {
        return false;
      }
    }
    return true;
  }

  function isAnyFilterActive(thresholds) {
    var i;
    for (i = 0; i < FILTER_FIELD_KEYS.length; i++) {
      var t = thresholds[FILTER_FIELD_KEYS[i]];
      if (typeof t === 'number' && !isNaN(t)) {
        return true;
      }
    }
    return false;
  }

  function addFilterBoundValue(bounds, val) {
    if (bounds.min === null || val < bounds.min) {
      bounds.min = val;
    }
    if (bounds.max === null || val > bounds.max) {
      bounds.max = val;
    }
  }

  function addFilterFieldToBounds(bounds, fieldKey, filterVal) {
    if (isFilterFieldExcluded(filterVal)) {
      return;
    }
    if (typeof filterVal === 'number') {
      addFilterBoundValue(bounds[fieldKey], filterVal);
      return;
    }
    if (
      filterVal &&
      typeof filterVal.min === 'number' &&
      typeof filterVal.max === 'number'
    ) {
      addFilterBoundValue(bounds[fieldKey], filterVal.min);
      addFilterBoundValue(bounds[fieldKey], filterVal.max);
    }
  }

  function computeFilterBounds(data) {
    var bounds = {
      bedCapacity: { min: null, max: null },
      extSqFt: { min: null, max: null },
      intSqFt: { min: null, max: null },
    };
    var i;
    var j;
    var k;
    for (i = 0; i < data.vendors.length; i++) {
      var vendor = data.vendors[i];
      for (j = 0; j < vendor.products.length; j++) {
        var product = vendor.products[j];
        if (!isProductInPicker(vendor, product)) continue;
        var spec = data.specs[product.id];
        if (!spec || !spec.filter) continue;
        for (k = 0; k < FILTER_FIELD_KEYS.length; k++) {
          addFilterFieldToBounds(
            bounds,
            FILTER_FIELD_KEYS[k],
            spec.filter[FILTER_FIELD_KEYS[k]]
          );
        }
      }
    }
    return bounds;
  }

  function parseFilterInputEl(el) {
    if (!el || el.value === '') return null;
    var n = parseFloat(el.value);
    if (isNaN(n)) return null;
    return n;
  }

  function getThresholdsFromInputs(inputsByKey) {
    return {
      bedCapacity: parseFilterInputEl(inputsByKey.bedCapacity),
      extSqFt: parseFilterInputEl(inputsByKey.extSqFt),
      intSqFt: parseFilterInputEl(inputsByKey.intSqFt),
    };
  }

  function syncSelectOptionDisabled(selectEl, data, thresholds) {
    var options = selectEl.querySelectorAll('option');
    var i;
    if (!isAnyFilterActive(thresholds)) {
      for (i = 0; i < options.length; i++) {
        if (options[i].value) {
          options[i].disabled = false;
        }
      }
      return;
    }
    for (i = 0; i < options.length; i++) {
      var opt = options[i];
      if (!opt.value) continue;
      opt.disabled = !productMatchesFilters(opt.value, data, thresholds);
    }
  }

  function setStickyHeaderOffsets() {
    var bar = document.querySelector('[data-filter-bar]');
    var bannerRow = document.querySelector('[data-untested-banner-row]');
    var filterH = bar ? bar.offsetHeight : 0;
    var bannerH =
      bannerRow && !bannerRow.hidden ? bannerRow.offsetHeight : 0;
    document.documentElement.style.setProperty(
      '--filter-bar-height',
      filterH + 'px'
    );
    document.documentElement.style.setProperty(
      '--col-head-sticky-top',
      filterH + bannerH + 'px'
    );
  }

  function flatOptionLabel(product) {
    var label = product.name;
    if (product.tested === false) label += ' *';
    return label;
  }

  function updateSelectSelectionClass(selectEl) {
    if (selectEl.value) {
      selectEl.classList.add('has-selection');
    } else {
      selectEl.classList.remove('has-selection');
    }
  }

  function buildProductSelect(selectEl, data) {
    selectEl.innerHTML = '';
    var first = document.createElement('option');
    first.value = '';
    first.textContent = 'Select a product \u25be';
    selectEl.appendChild(first);

    var hardDividerInserted = false;
    data.vendors.forEach(function (vendor) {
      var visible = [];
      vendor.products.forEach(function (p) {
        if (isProductInPicker(vendor, p)) {
          visible.push(p);
        }
      });
      if (visible.length === 0) {
        return;
      }
      if (vendor.structure === 'hard-sided' && !hardDividerInserted) {
        var divider = document.createElement('option');
        divider.disabled = true;
        divider.value = '';
        divider.textContent = '\u2014 Hard-sided \u2014';
        selectEl.appendChild(divider);
        hardDividerInserted = true;
      }
      var group = document.createElement('optgroup');
      group.label = vendor.name;
      visible.forEach(function (p) {
        var opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = flatOptionLabel(p);
        group.appendChild(opt);
      });
      selectEl.appendChild(group);
    });
    updateSelectSelectionClass(selectEl);
  }

  function renderValueCell(specKey, rawValue, productType) {
    if (typeof rawValue === 'string' && rawValue.length > 0) {
      var t = document.createTextNode(rawValue);
      var wrap = document.createElement('span');
      wrap.className = 'value-text';
      wrap.appendChild(t);
      return wrap;
    }
    if (
      rawValue === null &&
      specKey === 'bedCapacity' &&
      productType === 'connector'
    ) {
      var na = document.createElement('span');
      na.className = 'cell-na';
      na.textContent = 'N/A';
      return na;
    }
    var pill = document.createElement('span');
    pill.className = 'tbd-pill';
    pill.textContent = 'TBD';
    return pill;
  }

  function clearColumn(colIndex) {
    var cells = document.querySelectorAll('td.value-cell[data-col="' + colIndex + '"]');
    cells.forEach(function (cell) {
      cell.innerHTML = '';
    });
    var logoImg = document.querySelector('[data-vendor-logo="' + colIndex + '"]');
    if (logoImg) {
      logoImg.setAttribute('hidden', '');
      logoImg.removeAttribute('src');
      logoImg.alt = '';
    }
  }

  function fillColumn(colIndex, productId, data) {
    var ctx = findProductContext(data, productId);
    var specMap = data.specs[productId] || {};
    var productType = ctx.product.type;

    var cells = document.querySelectorAll('td.value-cell[data-col="' + colIndex + '"]');
    cells.forEach(function (cell) {
      var key = cell.getAttribute('data-spec-key');
      var raw = specMap[key];
      cell.innerHTML = '';
      var node = renderValueCell(key, raw, productType);
      cell.appendChild(node);
    });

    var logoImg = document.querySelector('[data-vendor-logo="' + colIndex + '"]');
    if (logoImg) {
      if (ctx && ctx.vendor.logo) {
        logoImg.src = ctx.vendor.logo;
        logoImg.alt = ctx.vendor.name;
        logoImg.removeAttribute('hidden');
      } else {
        logoImg.setAttribute('hidden', '');
        logoImg.removeAttribute('src');
        logoImg.alt = '';
      }
    }
  }

  function setPopoverPosition(popover, anchorBtn) {
    var rect = anchorBtn.getBoundingClientRect();
    var gutter = 8;
    popover.style.top = rect.bottom + gutter + 'px';
    var left = rect.left;
    var maxLeft = window.innerWidth - popover.offsetWidth - 16;
    if (left > maxLeft) left = Math.max(16, maxLeft);
    popover.style.left = left + 'px';
  }

  function getDisplayRows(specRows, pinnedRowKeys) {
    var pinnedSet = {};
    var rowByKey = {};
    var i;
    for (i = 0; i < pinnedRowKeys.length; i++) {
      pinnedSet[pinnedRowKeys[i]] = true;
    }
    for (i = 0; i < specRows.length; i++) {
      rowByKey[specRows[i].key] = specRows[i];
    }
    var display = [];
    for (i = 0; i < pinnedRowKeys.length; i++) {
      if (rowByKey[pinnedRowKeys[i]]) {
        display.push(rowByKey[pinnedRowKeys[i]]);
      }
    }
    for (i = 0; i < specRows.length; i++) {
      if (!pinnedSet[specRows[i].key]) {
        display.push(specRows[i]);
      }
    }
    return display;
  }

  function createPinSvg() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'pin-icon');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      'M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z'
    );
    svg.appendChild(path);
    return svg;
  }

  function init() {
    var data = window.VPC_COMPARISON_DATA;
    if (
      !data ||
      !data.specRows ||
      !data.vendors ||
      !data.specs
    ) {
      throw new Error('VPC_COMPARISON_DATA missing or invalid (see data.js).');
    }

    var tbody = document.querySelector('[data-spec-body]');
    if (!tbody) return;

    var pinnedRowKeys = [];

    function refillAllColumns() {
      for (var col = 0; col < 5; col++) {
        var sel = document.querySelector('[data-product-select="' + col + '"]');
        if (sel && sel.value) {
          fillColumn(col, sel.value, data);
        }
      }
      syncAllColumnGreyStates();
    }

    function togglePin(specKey) {
      var idx = pinnedRowKeys.indexOf(specKey);
      if (idx === -1) {
        pinnedRowKeys.push(specKey);
      } else {
        pinnedRowKeys.splice(idx, 1);
      }
      renderSpecBody();
      refillAllColumns();
    }

    function renderSpecBody() {
      tbody.innerHTML = '';
      var displayRows = getDisplayRows(data.specRows, pinnedRowKeys);
      displayRows.forEach(function (row) {
        var isPinned = pinnedRowKeys.indexOf(row.key) !== -1;
        var tr = document.createElement('tr');
        var tdLabel = document.createElement('th');
        tdLabel.className = 'spec-label-cell';
        tdLabel.scope = 'row';

        var inner = document.createElement('div');
        inner.className = 'spec-label-inner';

        var pinBtn = document.createElement('button');
        pinBtn.type = 'button';
        pinBtn.className = 'pin-trigger' + (isPinned ? ' is-pinned' : '');
        pinBtn.setAttribute('data-spec-key', row.key);
        pinBtn.setAttribute('aria-pressed', isPinned ? 'true' : 'false');
        pinBtn.setAttribute('aria-label', isPinned ? 'Unpin row' : 'Pin row');
        pinBtn.appendChild(createPinSvg());
        pinBtn.addEventListener('click', function (ev) {
          ev.preventDefault();
          togglePin(row.key);
        });

        var labelSpan = document.createElement('span');
        labelSpan.className = 'spec-label-text';
        labelSpan.textContent = row.label;

        inner.appendChild(pinBtn);
        inner.appendChild(labelSpan);
        tdLabel.appendChild(inner);
        tr.appendChild(tdLabel);

        for (var c = 0; c < 5; c++) {
          var td = document.createElement('td');
          td.className = 'value-cell';
          td.setAttribute('data-col', String(c));
          td.setAttribute('data-spec-key', row.key);
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      });
    }

    renderSpecBody();

    var selects = document.querySelectorAll('[data-product-select]');
    selects.forEach(function (sel) {
      buildProductSelect(sel, data);
    });

    var filterThresholds = { bedCapacity: null, extSqFt: null, intSqFt: null };
    var filterBounds = computeFilterBounds(data);
    var filterInputsByKey = {};
    var filterInputEls = document.querySelectorAll('[data-filter-input]');
    filterInputEls.forEach(function (el) {
      filterInputsByKey[el.getAttribute('data-filter-input')] = el;
    });

    FILTER_FIELD_KEYS.forEach(function (key) {
      var b = filterBounds[key];
      var input = filterInputsByKey[key];
      if (input && b.min !== null && b.max !== null) {
        input.min = String(b.min);
        input.max = String(b.max);
      }
    });

    function applyFilterState() {
      selects.forEach(function (sel) {
        syncSelectOptionDisabled(sel, data, filterThresholds);
      });
    }

    filterInputEls.forEach(function (el) {
      el.addEventListener('input', onFilterInputChange);
    });

    setStickyHeaderOffsets();
    applyFilterState();

    var sharedPopover = document.getElementById('vpc-info-popover');
    var openTrigger = null;

    function closePopover() {
      if (!sharedPopover) return;
      sharedPopover.hidden = true;
      sharedPopover.innerHTML = '';
      if (openTrigger) {
        openTrigger.setAttribute('aria-expanded', 'false');
        openTrigger = null;
      }
    }

    function openPopover(anchorBtn, text) {
      if (!sharedPopover || !text) return;
      sharedPopover.innerHTML = '';
      var p = document.createElement('p');
      p.className = 'popover-body';
      p.textContent = text;
      sharedPopover.appendChild(p);
      sharedPopover.hidden = false;
      window.requestAnimationFrame(function () {
        setPopoverPosition(sharedPopover, anchorBtn);
        window.requestAnimationFrame(function () {
          setPopoverPosition(sharedPopover, anchorBtn);
        });
      });
      if (openTrigger && openTrigger !== anchorBtn) {
        openTrigger.setAttribute('aria-expanded', 'false');
      }
      openTrigger = anchorBtn;
      anchorBtn.setAttribute('aria-expanded', 'true');
    }

    function togglePopover(anchorBtn, text) {
      if (!text) return;
      var isOpen = openTrigger === anchorBtn && !sharedPopover.hidden;
      if (isOpen) {
        closePopover();
      } else {
        openPopover(anchorBtn, text);
      }
    }

    function syncUntestedBanner() {
      var bannerRow = document.querySelector('[data-untested-banner-row]');
      if (!bannerRow) return;
      var hasUntested = false;
      for (var i = 0; i < 5; i++) {
        var sel = document.querySelector('[data-product-select="' + i + '"]');
        if (!sel || !sel.value) continue;
        var ctx = findProductContext(data, sel.value);
        if (ctx && ctx.product.tested === false) {
          hasUntested = true;
          break;
        }
      }
      if (hasUntested) {
        bannerRow.removeAttribute('hidden');
      } else {
        bannerRow.setAttribute('hidden', '');
      }
      setStickyHeaderOffsets();
    }

    function columnShouldGrey(colIndex) {
      if (!isAnyFilterActive(filterThresholds)) {
        return false;
      }
      var sel = document.querySelector('[data-product-select="' + colIndex + '"]');
      if (!sel || !sel.value) {
        return false;
      }
      return !productMatchesFilters(sel.value, data, filterThresholds);
    }

    function syncColumnGreyState(colIndex) {
      var grey = columnShouldGrey(colIndex);
      var head = document.querySelector('[data-col-head="' + colIndex + '"]');
      if (head) {
        head.classList.toggle('is-filter-nonconforming', grey);
      }
      document
        .querySelectorAll('td.value-cell[data-col="' + colIndex + '"]')
        .forEach(function (td) {
          td.classList.toggle('is-filter-nonconforming', grey);
        });
    }

    function syncAllColumnGreyStates() {
      for (var c = 0; c < 5; c++) {
        syncColumnGreyState(c);
      }
    }

    function onFilterInputChange() {
      filterThresholds = getThresholdsFromInputs(filterInputsByKey);
      syncAllColumnGreyStates();
      applyFilterState();
    }

    function syncColumnHeaderIcons(colIndex) {
      var infoBtn = document.querySelector('[data-info-trigger="' + colIndex + '"]');
      var quickAddBtn = document.querySelector(
        '[data-build-list-quick-add="' + colIndex + '"]'
      );
      var sel = document.querySelector('[data-product-select="' + colIndex + '"]');
      if (!sel) return;
      var pid = sel.value;

      if (!pid) {
        if (infoBtn) {
          if (openTrigger === infoBtn) {
            closePopover();
          }
          infoBtn.setAttribute('hidden', '');
        }
        if (quickAddBtn) {
          clearQuickAddFlash(quickAddBtn);
          quickAddBtn.setAttribute('hidden', '');
          quickAddBtn.setAttribute('aria-label', 'Add to Build List');
        }
        return;
      }

      var ctx = findProductContext(data, pid);

      if (quickAddBtn) {
        quickAddBtn.removeAttribute('hidden');
        var productName =
          ctx && ctx.product && ctx.product.name ? ctx.product.name : 'product';
        quickAddBtn.setAttribute(
          'aria-label',
          'Add ' + productName + ' to Build List'
        );
      }

      if (!infoBtn) return;
      if (!ctx) {
        if (openTrigger === infoBtn) {
          closePopover();
        }
        infoBtn.setAttribute('hidden', '');
        return;
      }
      var info = productInfoText(ctx.product);
      if (info) {
        infoBtn.removeAttribute('hidden');
      } else {
        if (openTrigger === infoBtn) {
          closePopover();
        }
        infoBtn.setAttribute('hidden', '');
      }
    }

    var quickAddFlashTimers = {};

    function clearQuickAddFlash(btn) {
      if (!btn) return;
      var col = btn.getAttribute('data-build-list-quick-add');
      if (col != null && quickAddFlashTimers[col]) {
        clearTimeout(quickAddFlashTimers[col]);
        delete quickAddFlashTimers[col];
      }
      btn.textContent = '+';
      btn.classList.remove('is-qty-flash');
      btn.classList.remove('is-pulsing');
    }

    function pulseQuickAdd(btn) {
      if (!btn) return;
      btn.classList.remove('is-pulsing');
      void btn.offsetWidth;
      btn.classList.add('is-pulsing');
    }

    function flashQuickAddQty(btn, qty) {
      if (!btn || typeof qty !== 'number') return;
      var col = btn.getAttribute('data-build-list-quick-add');
      if (col != null && quickAddFlashTimers[col]) {
        clearTimeout(quickAddFlashTimers[col]);
      }
      btn.textContent = '\u00d7' + qty;
      btn.classList.add('is-qty-flash');
      pulseQuickAdd(btn);
      if (col != null) {
        quickAddFlashTimers[col] = setTimeout(function () {
          btn.textContent = '+';
          btn.classList.remove('is-qty-flash');
          delete quickAddFlashTimers[col];
        }, 900);
      }
    }

    document.querySelectorAll('[data-build-list-quick-add]').forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        var col = btn.getAttribute('data-build-list-quick-add');
        var sel = document.querySelector('[data-product-select="' + col + '"]');
        if (!sel || !sel.value || typeof buildListQuickAdd !== 'function') return;
        var newQty = buildListQuickAdd(sel.value);
        if (typeof newQty === 'number') {
          flashQuickAddQty(btn, newQty);
        }
      });
    });

    if (sharedPopover) {
      document.querySelectorAll('[data-info-trigger]').forEach(function (btn) {
        btn.addEventListener('click', function (ev) {
          ev.preventDefault();
          var col = btn.getAttribute('data-info-trigger');
          var sel = document.querySelector('[data-product-select="' + col + '"]');
          if (!sel || !sel.value) return;
          var ctx = findProductContext(data, sel.value);
          var text = ctx ? productInfoText(ctx.product) : null;
          if (!text) return;
          togglePopover(btn, text);
          if (!sharedPopover.hidden) {
            window.requestAnimationFrame(function () {
              setPopoverPosition(sharedPopover, btn);
            });
          }
        });
      });

      document.addEventListener(
        'mousedown',
        function (ev) {
          if (sharedPopover.hidden) return;
          var t = ev.target;
          if (sharedPopover.contains(t)) return;
          if (t && t.closest && t.closest('[data-info-trigger]')) return;
          closePopover();
        },
        true
      );

      window.addEventListener('resize', function () {
        setStickyHeaderOffsets();
        if (!sharedPopover.hidden && openTrigger) {
          setPopoverPosition(sharedPopover, openTrigger);
        }
      });

      window.addEventListener(
        'scroll',
        function (ev) {
          if (sharedPopover.hidden) return;
          var t = ev.target;
          if (t && sharedPopover.contains(t)) return;
          closePopover();
        },
        { capture: true, passive: true }
      );
    } else {
      window.addEventListener('resize', function () {
        setStickyHeaderOffsets();
      });
    }

    selects.forEach(function (sel) {
      sel.addEventListener('change', function () {
        var col = sel.getAttribute('data-product-select');
        var idx = parseInt(col, 10);
        var pid = sel.value;
        updateSelectSelectionClass(sel);
        if (!pid) {
          clearColumn(idx);
        } else {
          fillColumn(idx, pid, data);
        }
        syncColumnHeaderIcons(idx);
        syncUntestedBanner();
        syncColumnGreyState(idx);
      });
    });

    for (var ci = 0; ci < 5; ci++) {
      syncColumnHeaderIcons(ci);
    }
    syncUntestedBanner();
  }

  function initHelp() {
    var overlay = document.getElementById('vpc-help-overlay');
    var trigger = document.querySelector('.help-trigger');
    if (!overlay || !trigger) return;

    var backdrop = overlay.querySelector('[data-help-backdrop]');
    var closeBtn = overlay.querySelector('[data-help-close]');

    function isOpen() {
      return !overlay.hidden;
    }

    function openHelp() {
      overlay.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    }

    function closeHelp() {
      overlay.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', function (ev) {
      ev.preventDefault();
      if (isOpen()) {
        closeHelp();
      } else {
        openHelp();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function (ev) {
        ev.preventDefault();
        closeHelp();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', function () {
        closeHelp();
      });
    }

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && isOpen()) {
        closeHelp();
      }
    });
  }

  function clampBuildListQty(n) {
    if (typeof n !== 'number' || isNaN(n)) return 1;
    var q = Math.floor(n);
    if (q < 1) return 1;
    if (q > 999) return 999;
    return q;
  }

  function lineBedContribution(filterBed, qty) {
    if (
      filterBed == null ||
      isFilterFieldExcluded(filterBed)
    ) {
      return { min: 0, max: 0, lineDisplay: '—' };
    }
    if (typeof filterBed === 'number') {
      var point = filterBed * qty;
      return {
        min: point,
        max: point,
        lineDisplay: String(point),
      };
    }
    if (
      filterBed &&
      typeof filterBed.min === 'number' &&
      typeof filterBed.max === 'number'
    ) {
      var lo = filterBed.min * qty;
      var hi = filterBed.max * qty;
      return {
        min: lo,
        max: hi,
        lineDisplay: lo === hi ? String(lo) : lo + '\u2013' + hi,
      };
    }
    return { min: 0, max: 0, lineDisplay: '—' };
  }

  function formatBedTotal(min, max) {
    if (min === max) return String(min);
    return min + '\u2013' + max;
  }

  function formatIntSqFt(n) {
    return String(n) + ' sq ft';
  }

  function formatPrintStamp(d) {
    try {
      return (
        'Printed ' +
        d.toLocaleString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      );
    } catch (err) {
      return 'Printed ' + d.toISOString();
    }
  }

  function initBuildList() {
    var data = window.VPC_COMPARISON_DATA;
    if (!data || !data.vendors || !data.specs) return;

    var compareView = document.querySelector('[data-view="compare"]');
    var buildListView = document.querySelector('[data-view="build-list"]');
    var trigger = document.querySelector('[data-build-list-trigger]');
    var badge = document.querySelector('[data-build-list-badge]');
    var backBtn = document.querySelector('[data-build-list-back]');
    var printBtn = document.querySelector('[data-build-list-print]');
    var selectEl = document.querySelector('[data-build-list-select]');
    var addQtyEl = document.querySelector('[data-build-list-add-qty]');
    var addBtn = document.querySelector('[data-build-list-add]');
    var emptyEl = document.querySelector('[data-build-list-empty]');
    var tableWrap = document.querySelector('[data-build-list-table-wrap]');
    var tbody = document.querySelector('[data-build-list-body]');
    var totalsEl = document.querySelector('[data-build-list-totals]');
    var totalBedsEl = document.querySelector('[data-build-list-total-beds]');
    var totalIntEl = document.querySelector('[data-build-list-total-int]');
    var printRegion = document.querySelector('[data-build-list-print-region]');
    var printStamp = document.querySelector('[data-build-list-print-stamp]');
    var printBody = document.querySelector('[data-build-list-print-body]');
    var printTotals = document.querySelector('[data-build-list-print-totals]');

    if (!compareView || !buildListView || !trigger || !selectEl || !tbody) {
      return;
    }

    var qtyById = {};
    var order = [];

    buildProductSelect(selectEl, data);

    function getActiveView() {
      return document.body.getAttribute('data-active-view') || 'compare';
    }

    function setActiveView(name) {
      if (name !== 'compare' && name !== 'build-list') return;
      document.body.setAttribute('data-active-view', name);
      if (name === 'compare') {
        compareView.removeAttribute('hidden');
        buildListView.setAttribute('hidden', '');
        trigger.removeAttribute('aria-disabled');
        trigger.setAttribute('aria-label', 'Build List');
      } else {
        compareView.setAttribute('hidden', '');
        buildListView.removeAttribute('hidden');
        trigger.setAttribute('aria-disabled', 'true');
        trigger.setAttribute('aria-label', 'Build List (current view)');
      }
      setStickyHeaderOffsets();
    }

    function syncBadge() {
      if (!badge) return;
      var count = order.length;
      if (count === 0) {
        badge.setAttribute('hidden', '');
        badge.textContent = '0';
        badge.classList.remove('is-pulsing');
        trigger.setAttribute('aria-label', 'Build List');
      } else {
        badge.removeAttribute('hidden');
        badge.textContent = String(count);
        trigger.setAttribute(
          'aria-label',
          'Build List, ' + count + (count === 1 ? ' item' : ' items')
        );
      }
      if (getActiveView() === 'build-list') {
        trigger.setAttribute('aria-label', 'Build List (current view)');
      }
    }

    function pulseBadge() {
      if (!badge || badge.hasAttribute('hidden')) return;
      badge.classList.remove('is-pulsing');
      void badge.offsetWidth;
      badge.classList.add('is-pulsing');
    }

    function addOrIncrement(productId, qty) {
      var n = clampBuildListQty(qty);
      if (!productId || !data.specs[productId]) return null;
      if (qtyById[productId] == null) {
        qtyById[productId] = n;
        order.push(productId);
      } else {
        qtyById[productId] = clampBuildListQty(qtyById[productId] + n);
      }
      renderBuildList();
      pulseBadge();
      return qtyById[productId];
    }

    /* Thin Compare→Build List hook: returns new qty only; no state exposed. */
    buildListQuickAdd = function (productId) {
      return addOrIncrement(productId, 1);
    };

    function setQuantity(productId, qty) {
      if (qtyById[productId] == null) return;
      var n = clampBuildListQty(qty);
      if (n < 1) {
        removeLine(productId);
        return;
      }
      qtyById[productId] = n;
      renderBuildList();
    }

    function removeLine(productId) {
      if (qtyById[productId] == null) return;
      delete qtyById[productId];
      var idx = order.indexOf(productId);
      if (idx !== -1) order.splice(idx, 1);
      renderBuildList();
    }

    function computeTotals() {
      var bedMin = 0;
      var bedMax = 0;
      var intTotal = 0;
      var i;
      for (i = 0; i < order.length; i++) {
        var id = order[i];
        var q = qtyById[id];
        var spec = data.specs[id];
        if (!spec || !spec.filter) continue;
        var beds = lineBedContribution(spec.filter.bedCapacity, q);
        bedMin += beds.min;
        bedMax += beds.max;
        var intSq =
          typeof spec.filter.intSqFt === 'number' ? spec.filter.intSqFt : 0;
        intTotal += intSq * q;
      }
      return { bedMin: bedMin, bedMax: bedMax, intTotal: intTotal };
    }

    function renderBuildList() {
      syncBadge();
      tbody.innerHTML = '';
      if (printBody) printBody.innerHTML = '';

      var isEmpty = order.length === 0;
      if (emptyEl) {
        if (isEmpty) emptyEl.removeAttribute('hidden');
        else emptyEl.setAttribute('hidden', '');
      }
      if (tableWrap) {
        if (isEmpty) tableWrap.setAttribute('hidden', '');
        else tableWrap.removeAttribute('hidden');
      }
      if (totalsEl) {
        if (isEmpty) totalsEl.setAttribute('hidden', '');
        else totalsEl.removeAttribute('hidden');
      }

      var i;
      for (i = 0; i < order.length; i++) {
        (function (productId) {
          var q = qtyById[productId];
          var ctx = findProductContext(data, productId);
          var spec = data.specs[productId] || {};
          var filter = spec.filter || {};
          var beds = lineBedContribution(filter.bedCapacity, q);
          var intSq =
            typeof filter.intSqFt === 'number' ? filter.intSqFt * q : 0;
          var vendorName = ctx && ctx.vendor ? ctx.vendor.name : '';
          var productName = ctx && ctx.product ? ctx.product.name : productId;
          var untested = ctx && ctx.product && ctx.product.tested === false;
          var label = vendorName
            ? vendorName + ' \u2014 ' + productName
            : productName;
          if (untested) label += ' *';

          var tr = document.createElement('tr');

          var tdProd = document.createElement('td');
          tdProd.className = 'build-list-product-cell';
          tdProd.textContent = label;
          tr.appendChild(tdProd);

          var tdQty = document.createElement('td');
          var qtyInput = document.createElement('input');
          qtyInput.type = 'number';
          qtyInput.className = 'build-list-line-qty';
          qtyInput.min = '1';
          qtyInput.max = '999';
          qtyInput.step = '1';
          qtyInput.value = String(q);
          qtyInput.setAttribute('aria-label', 'Quantity for ' + label);
          qtyInput.addEventListener('change', function () {
            setQuantity(productId, parseFloat(qtyInput.value));
          });
          tdQty.appendChild(qtyInput);
          tr.appendChild(tdQty);

          var tdBeds = document.createElement('td');
          tdBeds.textContent = beds.lineDisplay;
          tr.appendChild(tdBeds);

          var tdInt = document.createElement('td');
          tdInt.textContent = formatIntSqFt(intSq);
          tr.appendChild(tdInt);

          var tdRemove = document.createElement('td');
          var removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.className = 'build-list-remove';
          removeBtn.textContent = 'Remove';
          removeBtn.setAttribute('aria-label', 'Remove ' + label);
          removeBtn.addEventListener('click', function (ev) {
            ev.preventDefault();
            removeLine(productId);
          });
          tdRemove.appendChild(removeBtn);
          tr.appendChild(tdRemove);

          tbody.appendChild(tr);

          if (printBody) {
            var ptr = document.createElement('tr');
            var cells = [label, String(q), beds.lineDisplay, formatIntSqFt(intSq)];
            var c;
            for (c = 0; c < cells.length; c++) {
              var td = document.createElement('td');
              td.textContent = cells[c];
              ptr.appendChild(td);
            }
            printBody.appendChild(ptr);
          }
        })(order[i]);
      }

      var totals = computeTotals();
      var bedsText = formatBedTotal(totals.bedMin, totals.bedMax);
      var intText = formatIntSqFt(totals.intTotal);
      if (totalBedsEl) totalBedsEl.textContent = isEmpty ? '\u2014' : bedsText;
      if (totalIntEl) totalIntEl.textContent = isEmpty ? '\u2014' : intText;

      if (printTotals) {
        printTotals.innerHTML = '';
        if (!isEmpty) {
          var pBeds = document.createElement('p');
          pBeds.textContent = 'Total beds: ' + bedsText;
          var pInt = document.createElement('p');
          pInt.textContent = 'Total interior floorspace: ' + intText;
          printTotals.appendChild(pBeds);
          printTotals.appendChild(pInt);
        }
      }

      if (printStamp) {
        printStamp.textContent = formatPrintStamp(new Date());
      }
    }

    trigger.addEventListener('click', function (ev) {
      ev.preventDefault();
      if (getActiveView() === 'build-list') return;
      setActiveView('build-list');
    });

    if (backBtn) {
      backBtn.addEventListener('click', function (ev) {
        ev.preventDefault();
        setActiveView('compare');
      });
    }

    if (printBtn) {
      printBtn.addEventListener('click', function (ev) {
        ev.preventDefault();
        if (printStamp) {
          printStamp.textContent = formatPrintStamp(new Date());
        }
        window.print();
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', function (ev) {
        ev.preventDefault();
        var pid = selectEl.value;
        if (!pid) return;
        var qty = clampBuildListQty(parseFloat(addQtyEl && addQtyEl.value));
        addOrIncrement(pid, qty);
        selectEl.value = '';
        updateSelectSelectionClass(selectEl);
        if (addQtyEl) addQtyEl.value = '1';
      });
    }

    selectEl.addEventListener('change', function () {
      updateSelectSelectionClass(selectEl);
    });

    renderBuildList();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init();
      initHelp();
      initBuildList();
    });
  } else {
    init();
    initHelp();
    initBuildList();
  }
})();
