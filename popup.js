// --- Total requests: run as soon as popup opens (APIs & Services dashboard, default or custom date) ---
const valueEl = document.getElementById('totalRequestsValue');

function getTotalRequestsInPageFunc() {
        var maxTotal = 0;

        function sumTable(table, headerRow, headers, getRows, getCells) {
          var colIndex = -1;
          for (var j = 0; j < headers.length; j++) {
            var t = headers[j].textContent.trim().replace(/\s+/g, ' ');
            if (t === 'Requests' || (t.indexOf('Requests') === 0 && t.length < 20)) {
              colIndex = j;
              break;
            }
          }
          if (colIndex < 0) return 0;
          var rows = getRows(table);
          var sum = 0;
          for (var k = 0; k < rows.length; k++) {
            var cells = getCells(rows[k]);
            if (cells.length > colIndex) {
              var text = cells[colIndex].textContent.replace(/,/g, '').trim();
              var num = parseInt(text, 10);
              if (!isNaN(num)) sum += num;
            }
          }
          return sum;
        }

        var tables = document.querySelectorAll('table');
        for (var i = 0; i < tables.length; i++) {
          var table = tables[i];
          var headerRow = table.querySelector('thead tr, tr:first-child');
          if (!headerRow) continue;
          var headers = headerRow.querySelectorAll('th, td');
          var s = sumTable(table, headerRow, headers, function (t) { return t.querySelectorAll('tbody tr'); }, function (row) { return row.querySelectorAll('td'); });
          if (s > maxTotal) maxTotal = s;
        }
        var grids = document.querySelectorAll('[role="grid"]');
        for (var gi = 0; gi < grids.length; gi++) {
          var grid = grids[gi];
          var grow = grid.querySelectorAll('[role="row"]');
          if (grow.length === 0) continue;
          var headerCells = grow[0].querySelectorAll('[role="columnheader"], [role="gridcell"]');
          var gcol = -1;
          for (var gk = 0; gk < headerCells.length; gk++) {
            if (headerCells[gk].textContent.trim().replace(/\s+/g, ' ').indexOf('Requests') !== -1) {
              gcol = gk;
              break;
            }
          }
          if (gcol < 0) continue;
          var gridSum = 0;
          for (var gr = 1; gr < grow.length; gr++) {
            var gcells = grow[gr].querySelectorAll('[role="gridcell"], td');
            if (gcells.length > gcol) {
              var gtext = gcells[gcol].textContent.replace(/,/g, '').trim();
              var gnum = parseInt(gtext, 10);
              if (!isNaN(gnum)) gridSum += gnum;
            }
          }
          if (gridSum > maxTotal) maxTotal = gridSum;
        }
        var requestHeaders = document.querySelectorAll('th, td, [role="columnheader"]');
        for (var hi = 0; hi < requestHeaders.length; hi++) {
          var el = requestHeaders[hi];
          var h = el.textContent.trim().replace(/\s+/g, ' ');
          if (h !== 'Requests' && !(h.indexOf('Requests') === 0 && h.length < 20)) continue;
          var tbl = el.closest('table, [role="grid"]');
          if (!tbl) continue;
          var hrow = el.closest('tr, [role="row"]');
          if (!hrow) continue;
          var hdrs = hrow.querySelectorAll('th, td, [role="columnheader"]');
          var hcol = -1;
          for (var hk = 0; hk < hdrs.length; hk++) {
            if (hdrs[hk] === el) {
              hcol = hk;
              break;
            }
          }
          if (hcol < 0) continue;
          var arows = tbl.querySelectorAll('tbody tr, [role="row"]');
          var fallbackSum = 0;
          for (var ar = 0; ar < arows.length; ar++) {
            if (arows[ar] === hrow) continue;
            var acells = arows[ar].querySelectorAll('td, [role="gridcell"]');
            if (acells.length > hcol) {
              var atext = acells[hcol].textContent.replace(/,/g, '').trim();
              var anum = parseInt(atext, 10);
              if (!isNaN(anum)) fallbackSum += anum;
            }
          }
          if (fallbackSum > maxTotal) maxTotal = fallbackSum;
        }
        var dashTotal = document.body.innerText.match(/Total\s+requests\s*[:\s]*([\d,]+)/i);
        if (dashTotal) {
          var n = parseInt(dashTotal[1].replace(/,/g, ''), 10);
          if (!isNaN(n) && n > maxTotal) maxTotal = n;
        }
        return maxTotal;
}

function getSelectedDurationFromPageFunc() {
  var labels = [
    { text: '1 hour', preset: '1h' },
    { text: '6 hours', preset: '6h' },
    { text: '12 hours', preset: '12h' },
    { text: '1 day', preset: '1d' },
    { text: '2 days', preset: '2d' },
    { text: '4 days', preset: '4d' },
    { text: '7 days', preset: '7d' },
    { text: '14 days', preset: '14d' },
    { text: '30 days', preset: '30d' }
  ];
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  var node;
  while ((node = walker.nextNode())) {
    var t = node.textContent.trim();
    for (var i = 0; i < labels.length; i++) {
      if (t !== labels[i].text) continue;
      var el = node.parentElement;
      while (el && el !== document.body) {
        if (el.getAttribute && el.getAttribute('aria-selected') === 'true') return labels[i].preset;
        if (el.classList && (el.classList.contains('selected') || el.classList.contains('checked') || el.classList.contains('mat-selected') || el.classList.contains('mat-button-toggle-checked') || (el.getAttribute('class') || '').indexOf('selected') !== -1)) return labels[i].preset;
        var prev = el.previousElementSibling || el.parentElement;
        if (prev && prev.textContent && prev.textContent.indexOf('\u2713') !== -1) return labels[i].preset;
        el = el.parentElement;
      }
    }
  }
  var all = document.querySelectorAll('[aria-selected="true"], .selected, .mat-selected, [class*="selected"]');
  for (var j = 0; j < all.length; j++) {
    var txt = all[j].textContent.trim().replace(/\s+/g, ' ');
    for (var k = 0; k < labels.length; k++) {
      if (txt.indexOf(labels[k].text) !== -1) return labels[k].preset;
    }
  }
  return null;
}

function setPresetActive(preset) {
  document.querySelectorAll('.preset-btn').forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-preset') === preset);
  });
}

var DASHBOARD_URL = 'https://console.cloud.google.com/apis/dashboard';

function showDashboardRequiredOverlay() {
  var el = document.getElementById('dashboardRequiredOverlay');
  if (el) {
    el.classList.add('visible');
    el.setAttribute('aria-hidden', 'false');
  }
}

function hideDashboardRequiredOverlay() {
  var el = document.getElementById('dashboardRequiredOverlay');
  if (el) {
    el.classList.remove('visible');
    el.setAttribute('aria-hidden', 'true');
  }
}

var heartbeatId = null;
var heartbeatLastThree = [];

function stopHeartbeat() {
  if (heartbeatId) {
    clearInterval(heartbeatId);
    heartbeatId = null;
  }
  heartbeatLastThree = [];
  var dot = document.getElementById('heartbeatDot');
  if (dot) {
    dot.classList.remove('active');
    dot.classList.add('stopped');
  }
}

async function fetchAndShowTotal(opts) {
  opts = opts || {};
  var silent = opts.silent === true;
  if (!valueEl) return null;
  if (!silent) valueEl.textContent = 'Loading...';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isDashboard = tab?.url && tab.url.includes('console.cloud.google.com/apis/dashboard');
    if (!isDashboard || !tab?.id) {
      showDashboardRequiredOverlay();
      valueEl.textContent = 'Open dashboard to see total';
      stopHeartbeat();
      return null;
    }
    hideDashboardRequiredOverlay();

    var total = null;
    try {
      var msgPromise = new Promise(function (resolve, reject) {
        chrome.tabs.sendMessage(tab.id, { action: 'getTotalRequests', waitForTable: opts.waitForTable !== false }, function (response) {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });
      var timeoutPromise = new Promise(function (_, reject) {
        setTimeout(function () { reject(new Error('timeout')); }, 14000);
      });
      var response = await Promise.race([msgPromise, timeoutPromise]);
      if (response && typeof response.total === 'number') total = response.total;
    } catch (_) {}

    if (typeof total === 'number' && total >= 0) {
      valueEl.textContent = total.toLocaleString();
    } else if (!silent) {
      valueEl.textContent = '-';
    }
    return total;
  } catch (_) {
    if (!silent) valueEl.textContent = '-';
    return null;
  }
}

function startHeartbeat() {
  stopHeartbeat();
  var heartbeatIntervalMs = 5000;
  var sameCountRequired = 3;

  function tick() {
    fetchAndShowTotal({ waitForTable: false, silent: true }).then(function (total) {
      if (typeof total !== 'number') return;
      heartbeatLastThree.push(total);
      if (heartbeatLastThree.length > sameCountRequired) heartbeatLastThree.shift();
      if (heartbeatLastThree.length === sameCountRequired &&
          heartbeatLastThree[0] === heartbeatLastThree[1] &&
          heartbeatLastThree[1] === heartbeatLastThree[2]) {
        stopHeartbeat();
      }
    });
  }

  heartbeatId = setInterval(tick, heartbeatIntervalMs);
  var dot = document.getElementById('heartbeatDot');
  if (dot) {
    dot.classList.remove('stopped');
    dot.classList.add('active');
  }
}

document.getElementById('openDashboardLink').addEventListener('click', function (e) {
  e.preventDefault();
  chrome.tabs.create({ url: DASHBOARD_URL });
});

// Run total fetch when popup opens, then start heartbeat (poll every 5s; stop when last 3 fetches match)
fetchAndShowTotal().then(function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs[0];
    if (tab && tab.url && tab.url.includes('console.cloud.google.com/apis/dashboard')) startHeartbeat();
  });
});

document.getElementById('refreshTotalBtn').addEventListener('click', function () {
  stopHeartbeat();
  fetchAndShowTotal().then(function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tab = tabs[0];
      if (tab && tab.url && tab.url.includes('console.cloud.google.com/apis/dashboard')) startHeartbeat();
    });
  });
});

var PRESET_TO_GROUP_VALUE = {
  '1h': 'PT1H',
  '6h': 'PT6H',
  '12h': 'PT12H',
  '1d': 'P1D',
  '2d': 'P2D',
  '4d': 'P4D',
  '7d': 'P7D',
  '14d': 'P14D',
  '30d': 'P30D'
};

document.getElementById('applyBtn').addEventListener('click', async () => {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  if (!startDate || !endDate) {
    alert('Please select both start and end dates');
    return;
  }

  var activePreset = null;
  var activeBtn = document.querySelector('.preset-btn.active');
  if (activeBtn) activePreset = activeBtn.getAttribute('data-preset');

  var groupValue = activePreset ? PRESET_TO_GROUP_VALUE[activePreset] : null;
  var pageState;
  if (groupValue) {
    pageState = '("duration":("groupValue":"' + groupValue + '","customValue":null))';
  } else {
    pageState = '("duration":("groupValue":null,"customValue":("start":"' + startDate + '","end":"' + endDate + '")))';
  }

  var url = 'https://console.cloud.google.com/apis/dashboard?pageState=' + encodeURIComponent(pageState);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    try {
      var currentUrl = new URL(tab.url);
      var authuser = currentUrl.searchParams.get('authuser');
      var project = currentUrl.searchParams.get('project');
      var params = new URLSearchParams();
      if (authuser != null) params.set('authuser', authuser);
      if (project != null) params.set('project', project);
      var preserved = params.toString();
      if (preserved) url += '&' + preserved;
    } catch (_) {}
  }

  var targetTabId = tab && tab.id ? tab.id : null;
  chrome.tabs.update(targetTabId, { url: url });

  if (targetTabId) {
    function onTabUpdated(updatedTabId, changeInfo) {
      if (updatedTabId !== targetTabId || changeInfo.status !== 'complete') return;
      chrome.tabs.onUpdated.removeListener(onTabUpdated);
      setTimeout(function () {
        if (document.getElementById('totalRequestsValue')) fetchAndShowTotal();
      }, 500);
    }
    chrome.tabs.onUpdated.addListener(onTabUpdated);
  }
});

function formatDateForInput(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function getDateRangeForPreset(preset) {
  const end = new Date();
  const start = new Date();
  if (preset === '1h' || preset === '6h' || preset === '12h') {
    start.setTime(end.getTime());
  } else if (preset === '1d') {
    start.setDate(start.getDate() - 1);
  } else if (preset === '2d') {
    start.setDate(start.getDate() - 2);
  } else if (preset === '4d') {
    start.setDate(start.getDate() - 4);
  } else if (preset === '7d') {
    start.setDate(start.getDate() - 7);
  } else if (preset === '14d') {
    start.setDate(start.getDate() - 14);
  } else if (preset === '30d') {
    start.setDate(start.getDate() - 30);
  } else {
    start.setDate(start.getDate() - 30);
  }
  return { start: formatDateForInput(start), end: formatDateForInput(end) };
}

function getDefaultDateRange() {
  return getDateRangeForPreset('30d');
}

var GROUP_VALUE_TO_PRESET = {
  'PT1H': '1h', 'PT6H': '6h', 'PT12H': '12h',
  'P1D': '1d', 'P2D': '2d', 'P4D': '4d', 'P7D': '7d', 'P14D': '14d', 'P30D': '30d'
};

function parseDatesFromDashboardUrl(url) {
  try {
    const pageState = new URL(url).searchParams.get('pageState');
    if (!pageState) return null;
    const decoded = decodeURIComponent(pageState);
    var groupMatch = decoded.match(/"groupValue"\s*:\s*"(PT\d+H|P\d+D)"/);
    if (groupMatch && decoded.indexOf('"customValue":null') !== -1) {
      var preset = GROUP_VALUE_TO_PRESET[groupMatch[1]];
      if (preset) return { preset: preset };
    }
    var startMatch = decoded.match(/"start"\s*:\s*"(\d{4}-\d{2}-\d{2})"/);
    var endMatch = decoded.match(/"end"\s*:\s*"(\d{4}-\d{2}-\d{2})"/);
    if (startMatch && endMatch) return { start: startMatch[1], end: endMatch[1] };
  } catch (_) {}
  return null;
}

chrome.storage.local.get(['startDate', 'endDate'], async (result) => {
  const startEl = document.getElementById('startDate');
  const endEl = document.getElementById('endDate');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const onDashboard = tab?.url && tab.url.includes('console.cloud.google.com/apis/dashboard');

  if (onDashboard && tab.url) {
    const fromUrl = parseDatesFromDashboardUrl(tab.url);
    if (fromUrl && fromUrl.preset) {
      const range = getDateRangeForPreset(fromUrl.preset);
      startEl.value = range.start;
      endEl.value = range.end;
      setPresetActive(fromUrl.preset);
      chrome.storage.local.set({ startDate: range.start, endDate: range.end });
      return;
    }
    if (fromUrl && fromUrl.start && fromUrl.end) {
      startEl.value = fromUrl.start;
      endEl.value = fromUrl.end;
      setPresetActive('custom');
      return;
    }
    try {
      const dr = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { action: 'getSelectedDuration' }, (response) => {
          if (chrome.runtime.lastError) {
            resolve(null);
          } else {
            resolve(response);
          }
        });
      });
      const preset = dr && typeof dr.preset === 'string' ? dr.preset : null;
      if (preset && preset !== 'custom') {
        const range = getDateRangeForPreset(preset);
        startEl.value = range.start;
        endEl.value = range.end;
        setPresetActive(preset);
        chrome.storage.local.set({ startDate: range.start, endDate: range.end });
        return;
      }
    } catch (_) {}
    const def = getDefaultDateRange();
    startEl.value = def.start;
    endEl.value = def.end;
    setPresetActive('30d');
    return;
  }

  if (result.startDate) startEl.value = result.startDate;
  if (result.endDate) endEl.value = result.endDate;
  const def = getDefaultDateRange();
  if (!result.startDate) startEl.value = def.start;
  if (!result.endDate) endEl.value = def.end;
  setPresetActive(result.startDate && result.endDate ? 'custom' : null);
});

document.getElementById('presetBtns').addEventListener('click', (e) => {
  const btn = e.target.closest('.preset-btn');
  if (!btn) return;
  const preset = btn.getAttribute('data-preset');
  if (preset === 'custom') {
    setPresetActive('custom');
    return;
  }
  const range = getDateRangeForPreset(preset);
  document.getElementById('startDate').value = range.start;
  document.getElementById('endDate').value = range.end;
  setPresetActive(preset);
  chrome.storage.local.set({ startDate: range.start, endDate: range.end });
});

document.getElementById('startDate').addEventListener('change', (e) => {
  chrome.storage.local.set({ startDate: e.target.value });
});

document.getElementById('endDate').addEventListener('change', (e) => {
  chrome.storage.local.set({ endDate: e.target.value });
});
