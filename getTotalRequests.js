/**
 * Runs in the page context to find the APIs table "Requests" column and sum values.
 * Always computes the sum from visible tables/grids (main API list). Uses dashboard
 * "Total requests: N" only when it is higher than our sum and not from our own badge.
 */
function getTotalRequestsFromPage() {
  function isVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    let n = el;
    while (n && n !== document.body) {
      const style = window.getComputedStyle(n);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      n = n.parentElement;
    }
    return true;
  }

  const candidates = [];

  function sumTable(table, headers, getRows, getCells) {
    let colIndex = -1;
    for (let i = 0; i < headers.length; i++) {
      const t = headers[i].textContent.trim().replace(/\s+/g, ' ');
      if (t === 'Requests' || (t.startsWith('Requests') && t.length < 20)) {
        colIndex = i;
        break;
      }
    }
    if (colIndex < 0) return { sum: 0, rowCount: 0 };
    const rows = getRows(table);
    let sum = 0;
    for (const row of rows) {
      const cells = getCells(row);
      if (cells.length > colIndex) {
        const text = cells[colIndex].textContent.replace(/,/g, '').trim();
        const num = parseInt(text, 10);
        if (!isNaN(num)) sum += num;
      }
    }
    return { sum, rowCount: rows.length };
  }

  const tables = document.querySelectorAll('table');
  for (const table of tables) {
    if (!isVisible(table)) continue;
    const headerRow = table.querySelector('thead tr, tr:first-child');
    if (!headerRow) continue;
    const headers = headerRow.querySelectorAll('th, td');
    const { sum: s, rowCount: rc } = sumTable(table, headers, t => t.querySelectorAll('tbody tr'), row => row.querySelectorAll('td'));
    if (s > 0) candidates.push({ sum: s, rowCount: rc });
  }

  const grids = document.querySelectorAll('[role="grid"]');
  for (const grid of grids) {
    if (!isVisible(grid)) continue;
    const rows = grid.querySelectorAll('[role="row"]');
    if (rows.length <= 1) continue;
    const headerCells = rows[0].querySelectorAll('[role="columnheader"], [role="gridcell"]');
    let colIndex = -1;
    for (let i = 0; i < headerCells.length; i++) {
      if (headerCells[i].textContent.trim().replace(/\s+/g, ' ').includes('Requests')) {
        colIndex = i;
        break;
      }
    }
    if (colIndex < 0) continue;
    let gridSum = 0;
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r].querySelectorAll('[role="gridcell"], td');
      if (cells.length > colIndex) {
        const text = cells[colIndex].textContent.replace(/,/g, '').trim();
        const num = parseInt(text, 10);
        if (!isNaN(num)) gridSum += num;
      }
    }
    if (gridSum > 0) candidates.push({ sum: gridSum, rowCount: rows.length - 1 });
  }

  const requestHeaders = document.querySelectorAll('th, td, [role="columnheader"]');
  for (const el of requestHeaders) {
    const h = el.textContent.trim().replace(/\s+/g, ' ');
    if (h !== 'Requests' && !(h.startsWith('Requests') && h.length < 20)) continue;
    const table = el.closest('table, [role="grid"]');
    if (!table || !isVisible(table)) continue;
    const headerRow = el.closest('tr, [role="row"]');
    if (!headerRow) continue;
    const headers = headerRow.querySelectorAll('th, td, [role="columnheader"]');
    let colIndex = -1;
    for (let i = 0; i < headers.length; i++) {
      if (headers[i] === el) {
        colIndex = i;
        break;
      }
    }
    if (colIndex < 0) continue;
    const allRows = table.querySelectorAll('tbody tr, [role="row"]');
    let fallbackSum = 0;
    let dataRowCount = 0;
    for (const row of allRows) {
      if (row === headerRow) continue;
      dataRowCount++;
      const cells = row.querySelectorAll('td, [role="gridcell"]');
      if (cells.length > colIndex) {
        const text = cells[colIndex].textContent.replace(/,/g, '').trim();
        const num = parseInt(text, 10);
        if (!isNaN(num)) fallbackSum += num;
      }
    }
    if (fallbackSum > 0) candidates.push({ sum: fallbackSum, rowCount: dataRowCount });
  }

  if (candidates.length === 0) return 0;
  // Prefer the table with the most data rows (main API list for current range), not the largest sum (which may be stale)
  const best = candidates.reduce((a, b) => (b.rowCount > a.rowCount ? b : a));
  let result = best.sum;

  // Optionally use dashboard "Total requests: N" only if higher and not from our own badge (avoid stale/wrong value)
  const badge = document.getElementById('gcp-date-picker-total-requests');
  let pageText = document.body.innerText || '';
  if (badge) pageText = pageText.replace((badge.textContent || '').trim(), '');
  const dashMatch = pageText.match(/Total\s+requests\s*[:\s]*([\d,]+)/i);
  if (dashMatch) {
    const n = parseInt(dashMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(n) && n > result) result = n;
  }

  return result;
}
