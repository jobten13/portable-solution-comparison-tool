(function () {
  'use strict';

  function $(id) {
    return document.getElementById(id);
  }

  function normalizeFilter(s) {
    return String(s || '')
      .trim()
      .toLowerCase();
  }

  function readData() {
    var d = window.VPC_COMPARISON;
    if (!d || !Array.isArray(d.vendors) || !Array.isArray(d.sections)) {
      throw new Error('VPC_COMPARISON is missing or invalid (see data.js).');
    }
    return d;
  }

  function applyMeta(meta) {
    var title = (meta && meta.title) || 'VPC vendor comparison';
    document.title = title;
    var h1 = $('page-title');
    if (h1) h1.textContent = title;

    var sub = $('page-subtitle');
    if (sub) {
      var st = meta && meta.subtitle;
      if (st) {
        sub.textContent = st;
        sub.hidden = false;
      } else {
        sub.textContent = '';
        sub.hidden = true;
      }
    }

    var fn = $('page-footnote');
    if (fn) {
      var foot = meta && meta.footnote;
      if (foot) {
        fn.textContent = foot;
        fn.hidden = false;
      } else {
        fn.textContent = '';
        fn.hidden = true;
      }
    }
  }

  function buildVendorVisibilityKey(vendors) {
    try {
      var raw = sessionStorage.getItem('vpcComparisonVendorVisibility');
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || typeof o !== 'object') return null;
      var map = {};
      vendors.forEach(function (v) {
        if (o[v.id] === false) map[v.id] = false;
        else map[v.id] = true;
      });
      return map;
    } catch (e) {
      return null;
    }
  }

  function saveVendorVisibility(visibility) {
    try {
      sessionStorage.setItem('vpcComparisonVendorVisibility', JSON.stringify(visibility));
    } catch (e) {
      /* ignore */
    }
  }

  function renderThead(thead, vendors, visibility) {
    thead.innerHTML = '';
    var tr = document.createElement('tr');
    var thSpec = document.createElement('th');
    thSpec.scope = 'col';
    thSpec.className = 'comparison-table__corner';
    thSpec.textContent = 'Specification';
    tr.appendChild(thSpec);

    vendors.forEach(function (v) {
      var th = document.createElement('th');
      th.scope = 'col';
      th.className = 'comparison-table__vendor';
      th.dataset.vendorId = v.id;
      th.textContent = v.name;
      if (visibility[v.id] === false) {
        th.classList.add('is-hidden-col');
      }
      tr.appendChild(th);
    });
    thead.appendChild(tr);
  }

  function rowMatchesFilter(row, q) {
    if (!q) return true;
    var label = normalizeFilter(row.label);
    if (label.indexOf(q) !== -1) return true;
    if (row.note && normalizeFilter(row.note).indexOf(q) !== -1) return true;
    var vals = row.values || {};
    for (var k in vals) {
      if (Object.prototype.hasOwnProperty.call(vals, k)) {
        if (normalizeFilter(vals[k]).indexOf(q) !== -1) return true;
      }
    }
    return false;
  }

  function renderTbody(tbody, data, visibility, filterQ) {
    tbody.innerHTML = '';
    var vendors = data.vendors;
    var anyVisible = false;

    data.sections.forEach(function (sec) {
      var secHasVisible = false;
      var rows = sec.rows || [];

      rows.forEach(function (row) {
        if (rowMatchesFilter(row, filterQ)) secHasVisible = true;
      });
      if (!secHasVisible && filterQ) return;

      var secRow = document.createElement('tr');
      secRow.className = 'comparison-table__section-row';
      var secCell = document.createElement('th');
      secCell.colSpan = 1 + vendors.length;
      secCell.scope = 'colgroup';
      secCell.className = 'comparison-table__section';
      secCell.textContent = sec.title || '';
      secRow.appendChild(secCell);
      tbody.appendChild(secRow);

      rows.forEach(function (row) {
        if (!rowMatchesFilter(row, filterQ)) return;
        anyVisible = true;

        var tr = document.createElement('tr');
        tr.className = 'comparison-table__spec-row';
        tr.dataset.rowId = row.id || '';

        var th = document.createElement('th');
        th.scope = 'row';
        th.className = 'comparison-table__label';
        var labelSpan = document.createElement('span');
        labelSpan.className = 'comparison-table__label-text';
        labelSpan.textContent = row.label || '';
        th.appendChild(labelSpan);
        if (row.note) {
          var note = document.createElement('span');
          note.className = 'comparison-table__label-note';
          note.textContent = row.note;
          th.appendChild(note);
        }
        tr.appendChild(th);

        vendors.forEach(function (v) {
          var td = document.createElement('td');
          td.className = 'comparison-table__value';
          td.dataset.vendorId = v.id;
          var val = row.values && Object.prototype.hasOwnProperty.call(row.values, v.id) ? row.values[v.id] : '—';
          td.textContent = val === undefined || val === null || val === '' ? '—' : String(val);
          if (visibility[v.id] === false) {
            td.classList.add('is-hidden-col');
          }
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });
    });

    return anyVisible;
  }

  function renderVendorToggles(container, vendors, visibility, onChange) {
    container.innerHTML = '';
    var legend = document.createElement('legend');
    legend.className = 'vendor-toggles__legend';
    legend.textContent = 'Show vendors';
    container.appendChild(legend);

    vendors.forEach(function (v) {
      var id = 'vendor-toggle-' + v.id;
      var label = document.createElement('label');
      label.className = 'vendor-toggle';
      label.htmlFor = id;

      var input = document.createElement('input');
      input.type = 'checkbox';
      input.id = id;
      input.checked = visibility[v.id] !== false;
      input.dataset.vendorId = v.id;
      input.addEventListener('change', function () {
        visibility[v.id] = input.checked;
        saveVendorVisibility(visibility);
        onChange();
      });

      var span = document.createElement('span');
      span.textContent = v.name;

      label.appendChild(input);
      label.appendChild(span);
      container.appendChild(label);
    });
  }

  function updateFilterStatus(statusEl, filterQ, rowCount) {
    if (!statusEl) return;
    if (!filterQ) {
      statusEl.textContent = '';
      return;
    }
    if (rowCount === 0) {
      statusEl.textContent = 'No rows match this filter.';
    } else {
      statusEl.textContent = 'Showing ' + rowCount + ' matching row(s).';
    }
  }

  function init() {
    var data = readData();
    applyMeta(data.meta || {});

    var vendors = data.vendors;
    var visibility = buildVendorVisibilityKey(vendors);
    if (!visibility) {
      visibility = {};
      vendors.forEach(function (v) {
        visibility[v.id] = true;
      });
    }

    var thead = $('comparison-thead');
    var tbody = $('comparison-tbody');
    var filterInput = $('row-filter');
    var statusEl = $('filter-status');
    var toggleRoot = $('vendor-toggles');

    function paint() {
      var q = normalizeFilter(filterInput && filterInput.value);
      renderThead(thead, vendors, visibility);
      var count = 0;
      data.sections.forEach(function (sec) {
        (sec.rows || []).forEach(function (row) {
          if (rowMatchesFilter(row, q)) count++;
        });
      });

      var any = renderTbody(tbody, data, visibility, q);
      updateFilterStatus(statusEl, q, any ? count : 0);

      if (!any && q) {
        var empty = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 1 + vendors.length;
        td.className = 'comparison-table__empty';
        td.textContent = 'No specifications match this filter.';
        empty.appendChild(td);
        tbody.appendChild(empty);
      }
    }

    renderVendorToggles(toggleRoot, vendors, visibility, paint);

    if (filterInput) {
      filterInput.addEventListener('input', paint);
    }

    paint();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
