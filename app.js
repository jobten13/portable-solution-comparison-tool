(function () {
  'use strict';

  var EM_DASH = '\u2014';

  function getHdtInfo(data) {
    for (var i = 0; i < data.vendors.length; i++) {
      var v = data.vendors[i];
      if (v.hasInfoPopover && v.infoText) {
        return v.infoText;
      }
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
    var label = vendor.name + ' ' + EM_DASH + ' ' + product.name;
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
      vendor.products.forEach(function (p) {
        var opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = flatOptionLabel(vendor, p);
        selectEl.appendChild(opt);
      });
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
      logoImg.src = '';
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
        logoImg.src = '';
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

    data.specRows.forEach(function (row) {
      var tr = document.createElement('tr');
      var tdLabel = document.createElement('th');
      tdLabel.className = 'spec-label-cell';
      tdLabel.scope = 'row';
      tdLabel.textContent = row.label;
      tr.appendChild(tdLabel);
      for (var c = 0; c < 3; c++) {
        var td = document.createElement('td');
        td.className = 'value-cell';
        td.setAttribute('data-col', String(c));
        td.setAttribute('data-spec-key', row.key);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });

    var selects = document.querySelectorAll('[data-product-select]');
    selects.forEach(function (sel) {
      buildProductSelect(sel, data);
    });

    var hdtInfo = getHdtInfo(data);
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

    function openPopover(anchorBtn) {
      if (!sharedPopover || !hdtInfo) return;
      sharedPopover.innerHTML = '';
      var p = document.createElement('p');
      p.className = 'popover-body';
      p.textContent = hdtInfo;
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

    function togglePopover(anchorBtn) {
      if (!hdtInfo) return;
      var isOpen = openTrigger === anchorBtn && !sharedPopover.hidden;
      if (isOpen) {
        closePopover();
      } else {
        openPopover(anchorBtn);
      }
    }

    function syncUntestedFootnote() {
      var footnote = document.querySelector('[data-untested-footnote]');
      if (!footnote) return;
      var hasUntested = false;
      for (var i = 0; i < 3; i++) {
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

    function syncColumnInfoTrigger(colIndex) {
      if (!hdtInfo) return;
      var btn = document.querySelector('[data-info-trigger="' + colIndex + '"]');
      var sel = document.querySelector('[data-product-select="' + colIndex + '"]');
      if (!btn || !sel) return;
      var pid = sel.value;
      if (!pid) {
        if (openTrigger === btn) closePopover();
        btn.setAttribute('hidden', '');
        return;
      }
      var ctx = findProductContext(data, pid);
      var show = ctx && ctx.vendor.name === 'HDT';
      if (show) {
        btn.removeAttribute('hidden');
      } else {
        if (openTrigger === btn) closePopover();
        btn.setAttribute('hidden', '');
      }
    }

    if (hdtInfo) {
      document.querySelectorAll('[data-info-trigger]').forEach(function (btn) {
        btn.addEventListener('click', function (ev) {
          ev.preventDefault();
          togglePopover(btn);
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
        syncColumnInfoTrigger(idx);
        syncUntestedFootnote();
      });
    });

    for (var ci = 0; ci < 3; ci++) {
      syncColumnInfoTrigger(ci);
    }
    syncUntestedFootnote();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
