/**
 * Runs in the page context to find the APIs table "Requests" column and sum values.
 * Used by content script (for badge). Popup uses same logic via executeScript.
 */
function getTotalRequestsFromPage() {
  let total = 0;

  // Try standard <table>
  const tables = document.querySelectorAll('table');
  for (const table of tables) {
    const headerRow = table.querySelector('thead tr, tr:first-child');
    if (!headerRow) continue;
    const headers = headerRow.querySelectorAll('th, td');
    let colIndex = -1;
    for (let i = 0; i < headers.length; i++) {
      const t = headers[i].textContent.trim().replace(/\s+/g, ' ');
      if (t === 'Requests' || (t.startsWith('Requests') && t.length < 20)) {
        colIndex = i;
        break;
      }
    }
    if (colIndex < 0) continue;
    const rows = table.querySelectorAll('tbody tr');
    if (rows.length === 0) continue;
    for (const row of rows) {
      const cells = row.querySelectorAll('td');
      if (cells.length > colIndex) {
        const text = cells[colIndex].textContent.replace(/,/g, '').trim();
        const num = parseInt(text, 10);
        if (!isNaN(num)) total += num;
      }
    }
    if (total > 0) return total;
  }

  // Try role="grid" (e.g. Angular Material / custom components)
  const grids = document.querySelectorAll('[role="grid"]');
  for (const grid of grids) {
    const rows = grid.querySelectorAll('[role="row"]');
    let colIndex = -1;
    const firstRow = rows[0];
    if (!firstRow) continue;
    const headerCells = firstRow.querySelectorAll('[role="columnheader"], [role="gridcell"]');
    for (let i = 0; i < headerCells.length; i++) {
      if (headerCells[i].textContent.trim().replace(/\s+/g, ' ').includes('Requests')) {
        colIndex = i;
        break;
      }
    }
    if (colIndex < 0) continue;
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r].querySelectorAll('[role="gridcell"], td');
      if (cells.length > colIndex) {
        const text = cells[colIndex].textContent.replace(/,/g, '').trim();
        const num = parseInt(text, 10);
        if (!isNaN(num)) total += num;
      }
    }
    if (total > 0) return total;
  }

  // Fallback: find any element with text "Requests", then find parent table/grid and column
  const requestHeaders = document.querySelectorAll('th, td, [role="columnheader"]');
  for (const el of requestHeaders) {
    const h = el.textContent.trim().replace(/\s+/g, ' ');
  if (h !== 'Requests' && !(h.startsWith('Requests') && h.length < 20)) continue;
    const table = el.closest('table, [role="grid"]');
    if (!table) continue;
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
    for (const row of allRows) {
      if (row === headerRow) continue;
      const cells = row.querySelectorAll('td, [role="gridcell"]');
      if (cells.length > colIndex) {
        const text = cells[colIndex].textContent.replace(/,/g, '').trim();
        const num = parseInt(text, 10);
        if (!isNaN(num)) total += num;
      }
    }
    if (total > 0) return total;
  }

  return total;
}
