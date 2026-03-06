// Injects a visual date picker button into the GCP dashboard
const button = document.createElement('button');
button.textContent = 'Custom Date Range';
button.style.cssText = 'padding: 8px 16px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;';
button.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'openDatePicker' });
});

const header = document.querySelector('[role="banner"]') || document.querySelector('header');
if (header) header.appendChild(button);

// Total requests badge: show sum of Requests column on the page
function injectTotalRequestsBadge() {
  const total = typeof getTotalRequestsFromPage === 'function' ? getTotalRequestsFromPage() : 0;
  if (total === 0) return;
  let el = document.getElementById('gcp-date-picker-total-requests');
  if (!el) {
    el = document.createElement('div');
    el.id = 'gcp-date-picker-total-requests';
    el.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;background:#4285f4;color:#fff;padding:10px 16px;border-radius:8px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
    document.body.appendChild(el);
  }
  el.textContent = 'Total requests: ' + total.toLocaleString();
}

// Run badge after table may have loaded (dashboard loads data async)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(injectTotalRequestsBadge, 2000));
} else {
  setTimeout(injectTotalRequestsBadge, 2000);
}

// Observe for dynamic table load (debounced)
let badgeUpdateTimer = null;
const observer = new MutationObserver(() => {
  if (badgeUpdateTimer) clearTimeout(badgeUpdateTimer);
  badgeUpdateTimer = setTimeout(() => {
    badgeUpdateTimer = null;
    const el = document.getElementById('gcp-date-picker-total-requests');
    if (!el) return;
    const total = typeof getTotalRequestsFromPage === 'function' ? getTotalRequestsFromPage() : 0;
    if (total > 0) el.textContent = 'Total requests: ' + total.toLocaleString();
  }, 500);
});
observer.observe(document.body, { childList: true, subtree: true });

function getSelectedDurationFromPage() {
  const labels = [
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

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while ((node = walker.nextNode())) {
    const t = node.textContent.trim();
    for (let i = 0; i < labels.length; i++) {
      if (t !== labels[i].text) continue;
      let el = node.parentElement;
      while (el && el !== document.body) {
        if (el.getAttribute && el.getAttribute('aria-selected') === 'true') return labels[i].preset;
        if (
          el.classList &&
          (el.classList.contains('selected') ||
            el.classList.contains('checked') ||
            el.classList.contains('mat-selected') ||
            el.classList.contains('mat-button-toggle-checked') ||
            (el.getAttribute('class') || '').indexOf('selected') !== -1)
        ) {
          return labels[i].preset;
        }
        const prev = el.previousElementSibling || el.parentElement;
        if (prev && prev.textContent && prev.textContent.indexOf('\u2713') !== -1) return labels[i].preset;
        el = el.parentElement;
      }
    }
  }
  const all = document.querySelectorAll('[aria-selected="true"], .selected, .mat-selected, [class*="selected"]');
  for (let j = 0; j < all.length; j++) {
    const txt = all[j].textContent.trim().replace(/\s+/g, ' ');
    for (let k = 0; k < labels.length; k++) {
      if (txt.indexOf(labels[k].text) !== -1) return labels[k].preset;
    }
  }
  return null;
}

// Reply to popup messages
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'getSelectedDuration') {
    const preset = getSelectedDurationFromPage();
    sendResponse({ preset });
    return;
  }

  if (msg.action === 'getTotalRequests') {
    const waitForTable = msg.waitForTable === true;
    const pollMs = 400;
    const maxWaitMs = 12000;
    const minWaitMs = 2500;  // don't trust "stable" until full table has had time to load
    const stableCount = 3;   // same total this many times in a row

    function getTotal() {
      return typeof getTotalRequestsFromPage === 'function' ? getTotalRequestsFromPage() : 0;
    }

    if (!waitForTable) {
      sendResponse({ total: getTotal() });
      return;
    }

    let attempts = 0;
    const maxAttempts = maxWaitMs / pollMs;
    const minAttempts = minWaitMs / pollMs;
    let maxTotal = 0;
    let lastTotal = 0;
    let stable = 0;

    const interval = setInterval(() => {
      attempts++;
      const total = getTotal();
      if (total > maxTotal) maxTotal = total;
      if (total === lastTotal && total > 0) {
        stable++;
        // Only accept "stable" after minimum wait, so we don't return a partial table sum (e.g. 1,210) before full table loads (e.g. 16,882)
        if (stable >= stableCount && attempts >= minAttempts) {
          clearInterval(interval);
          sendResponse({ total: maxTotal > 0 ? maxTotal : total });
          return;
        }
      } else {
        stable = 0;
      }
      lastTotal = total;
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        sendResponse({ total: maxTotal > 0 ? maxTotal : total });
      }
    }, pollMs);
    return true; // keep channel open for async sendResponse
  }
});
