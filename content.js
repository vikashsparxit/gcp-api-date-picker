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

// Reply to popup when it asks for total
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'getTotalRequests') {
    const total = typeof getTotalRequestsFromPage === 'function' ? getTotalRequestsFromPage() : 0;
    sendResponse({ total });
  }
});
