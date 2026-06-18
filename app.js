(function () {
  'use strict';

  var EM_DASH = '\u2014';
  var UNTESTED_POPOVER_TEXT =
    'Not independently tested by UC Davis during IMPACTS project events or exercises.';

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

  function flatOptionLabel(vendor, product) {
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

    data.vendors.forEach(function (vendor) {
      var group = document.createElement('optgroup');
      group.label = vendor.name;
      vendor.products.forEach(function (p) {
        var opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = flatOptionLabel(vendor, p);
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
        pinBtn.setAttribute('data-pin-trigger', '');
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

    var sharedPopover = document.getElementById('vpc-hdt-popover');
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

    function syncUntestedFootnote() {
      var footnote = document.querySelector('[data-untested-footnote]');
      if (!footnote) return;
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
        footnote.removeAttribute('hidden');
      } else {
        footnote.setAttribute('hidden', '');
      }
    }

    function syncColumnHeaderIcons(colIndex) {
      var infoBtn = document.querySelector('[data-info-trigger="' + colIndex + '"]');
      var untestedBtn = document.querySelector(
        '[data-untested-trigger="' + colIndex + '"]'
      );
      var sel = document.querySelector('[data-product-select="' + colIndex + '"]');
      if (!infoBtn || !untestedBtn || !sel) return;
      var pid = sel.value;
      if (!pid) {
        if (openTrigger === infoBtn || openTrigger === untestedBtn) {
          closePopover();
        }
        infoBtn.setAttribute('hidden', '');
        untestedBtn.setAttribute('hidden', '');
        return;
      }
      var ctx = findProductContext(data, pid);
      if (!ctx) {
        if (openTrigger === infoBtn || openTrigger === untestedBtn) {
          closePopover();
        }
        infoBtn.setAttribute('hidden', '');
        untestedBtn.setAttribute('hidden', '');
        return;
      }
      var info = productInfoText(ctx.product);
      if (info) {
        if (openTrigger === untestedBtn) closePopover();
        infoBtn.removeAttribute('hidden');
        untestedBtn.setAttribute('hidden', '');
      } else if (ctx.product.tested === false) {
        if (openTrigger === infoBtn) closePopover();
        infoBtn.setAttribute('hidden', '');
        untestedBtn.removeAttribute('hidden');
      } else {
        if (openTrigger === infoBtn || openTrigger === untestedBtn) {
          closePopover();
        }
        infoBtn.setAttribute('hidden', '');
        untestedBtn.setAttribute('hidden', '');
      }
    }

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

      document.querySelectorAll('[data-untested-trigger]').forEach(function (btn) {
        btn.addEventListener('click', function (ev) {
          ev.preventDefault();
          togglePopover(btn, UNTESTED_POPOVER_TEXT);
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
          if (t && t.closest && t.closest('[data-untested-trigger]')) return;
          closePopover();
        },
        true
      );

      window.addEventListener('resize', function () {
        if (!sharedPopover.hidden && openTrigger) {
          setPopoverPosition(sharedPopover, openTrigger);
        }
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
        syncUntestedFootnote();
      });
    });

    for (var ci = 0; ci < 5; ci++) {
      syncColumnHeaderIcons(ci);
    }
    syncUntestedFootnote();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
