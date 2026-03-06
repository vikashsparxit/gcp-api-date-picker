// Injects a visual date picker button into the GCP dashboard
const button = document.createElement('button');
button.textContent = '📅 Custom Date Range';
button.style.cssText = 'padding: 8px 16px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;';
button.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'openDatePicker' });
});

const header = document.querySelector('[role="banner"]') || document.querySelector('header');
if (header) header.appendChild(button);
