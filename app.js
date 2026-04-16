(function () {
  'use strict';

  var VENDORS;
  var SPECS;
  var DATA;

  var activeVendors;
  var removedVendors;
  var activeSpecs;

  function loadData() {
    var raw = window.VPC_COMPARISON_DATA;
    if (!raw || !raw.vendors || !raw.specs || !raw.values) {
      throw new Error('VPC_COMPARISON_DATA missing or invalid (see data.js).');
    }
    VENDORS = raw.vendors;
    SPECS = raw.specs;
    DATA = raw.values;
  }

  function renderVendorChips() {
    var wrap = document.getElementById('vendor-chips');
    wrap.innerHTML = '';
    VENDORS.forEach(function (v) {
      if (removedVendors.indexOf(v.id) !== -1) return;
      var btn = document.createElement('button');
      var isActive = activeVendors.has(v.id);
      btn.className = 'chip' + (isActive ? ' active' : '');
      btn.innerHTML = (isActive ? '<span class="chip-check">✓</span>' : '') + v.name;
      btn.onclick = function () {
        if (activeVendors.has(v.id)) activeVendors.delete(v.id);
        else activeVendors.add(v.id);
        render();
      };
      wrap.appendChild(btn);
    });
  }

  function renderSpecChips() {
    var wrap = document.getElementById('spec-chips');
    wrap.innerHTML = '';
    SPECS.forEach(function (s) {
      var btn = document.createElement('button');
      var isActive = activeSpecs.has(s);
      btn.className = 'chip' + (isActive ? ' active' : '');
      var label = s.length > 28 ? s.slice(0, 26) + '…' : s;
      btn.innerHTML = (isActive ? '<span class="chip-check">✓</span>' : '') + label;
      btn.title = s;
      btn.onclick = function () {
        if (activeSpecs.has(s)) activeSpecs.delete(s);
        else activeSpecs.add(s);
        render();
      };
      wrap.appendChild(btn);
    });
  }

  function renderMeta() {
    var visible = VENDORS.filter(function (v) {
      return activeVendors.has(v.id) && removedVendors.indexOf(v.id) === -1;
    });
    var specs = SPECS.filter(function (s) {
      return activeSpecs.has(s);
    });
    document.getElementById('comparison-count').innerHTML =
      'Showing <strong>' +
      visible.length +
      '</strong> vendor' +
      (visible.length !== 1 ? 's' : '') +
      ' · <strong>' +
      specs.length +
      '</strong> specification' +
      (specs.length !== 1 ? 's' : '');
    document.getElementById('header-meta').textContent =
      VENDORS.length + ' vendors · ' + SPECS.length + ' specifications';

    var restoreRow = document.getElementById('restore-row');
    if (removedVendors.length === 0) {
      restoreRow.innerHTML = '';
      return;
    }
    var html = '<span class="restore-label">Removed:</span>';
    removedVendors.forEach(function (id) {
      var v = VENDORS.find(function (x) {
        return x.id === id;
      });
      html +=
        '<button type="button" class="restore-btn" data-restore-id="' +
        id +
        '">+ ' +
        v.name +
        '</button>';
    });
    restoreRow.innerHTML = html;
    restoreRow.querySelectorAll('[data-restore-id]').forEach(function (btn) {
      btn.onclick = function () {
        restoreVendor(btn.getAttribute('data-restore-id'));
      };
    });
  }

  function renderTable() {
    var wrap = document.getElementById('table-wrap');
    var visibleVendors = VENDORS.filter(function (v) {
      return activeVendors.has(v.id) && removedVendors.indexOf(v.id) === -1;
    });
    var visibleSpecs = SPECS.filter(function (s) {
      return activeSpecs.has(s);
    });

    if (visibleVendors.length === 0) {
      wrap.innerHTML =
        '<div class="empty-table"><div class="empty-icon">□</div><p>No vendors selected.<br>Use the toggles above to add vendors to compare.</p></div>';
      return;
    }
    if (visibleSpecs.length === 0) {
      wrap.innerHTML =
        '<div class="empty-table"><div class="empty-icon">≡</div><p>No specifications selected.<br>Enable at least one spec filter above.</p></div>';
      return;
    }

    var colHtml = '<col class="spec-col">';
    visibleVendors.forEach(function () {
      colHtml += '<col>';
    });

    var headHtml = '<tr><th></th>';
    visibleVendors.forEach(function (v) {
      headHtml +=
        '<th><div class="vendor-header-cell">' +
        '<div class="vendor-badge">' +
        v.initials +
        '</div>' +
        '<div class="vendor-full-name">' +
        v.name +
        '</div>' +
        '<button type="button" class="remove-vendor-btn" data-remove-id="' +
        v.id +
        '">✕ Remove</button>' +
        '</div></th>';
    });
    headHtml += '</tr>';

    var bodyHtml = '';
    visibleSpecs.forEach(function (spec) {
      var specIdx = SPECS.indexOf(spec);
      bodyHtml += '<tr><td class="spec-label-cell">' + spec + '</td>';
      visibleVendors.forEach(function (v) {
        var val = DATA[v.id][specIdx];
        var display = val ? val : '<span class="tbd-pill">TBD</span>';
        bodyHtml += '<td class="data-cell">' + display + '</td>';
      });
      bodyHtml += '</tr>';
    });

    wrap.innerHTML =
      '<table><colgroup>' +
      colHtml +
      '</colgroup><thead>' +
      headHtml +
      '</thead><tbody>' +
      bodyHtml +
      '</tbody></table>';

    wrap.querySelectorAll('[data-remove-id]').forEach(function (btn) {
      btn.onclick = function () {
        removeVendor(btn.getAttribute('data-remove-id'));
      };
    });
  }

  function removeVendor(id) {
    activeVendors.delete(id);
    removedVendors.push(id);
    render();
  }

  function restoreVendor(id) {
    removedVendors = removedVendors.filter(function (x) {
      return x !== id;
    });
    activeVendors.add(id);
    render();
  }

  function render() {
    renderVendorChips();
    renderSpecChips();
    renderMeta();
    renderTable();
    document.getElementById('footer-right').textContent = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  }

  function init() {
    loadData();
    activeVendors = new Set(VENDORS.map(function (v) {
      return v.id;
    }));
    removedVendors = [];
    activeSpecs = new Set(SPECS);
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
