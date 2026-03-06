document.getElementById('applyBtn').addEventListener('click', async () => {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    const pageState = `("duration":("groupValue":null,"customValue":("start":"${startDate}","end":"${endDate}")))`;
    let url = `https://console.cloud.google.com/apis/dashboard?pageState=${encodeURIComponent(pageState)}`;

    // Preserve authuser and project (and other params) from current tab so account/project don't change
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      const currentUrl = new URL(tab.url);
      const authuser = currentUrl.searchParams.get('authuser');
      const project = currentUrl.searchParams.get('project');
      const params = new URLSearchParams();
      if (authuser != null) params.set('authuser', authuser);
      if (project != null) params.set('project', project);
      const preserved = params.toString();
      if (preserved) url += '&' + preserved;
    }

    chrome.tabs.update({ url });
  });
  
  // Load saved dates
  chrome.storage.local.get(['startDate', 'endDate'], (result) => {
    if (result.startDate) document.getElementById('startDate').value = result.startDate;
    if (result.endDate) document.getElementById('endDate').value = result.endDate;
  });
  
  // Save dates when changed
  document.getElementById('startDate').addEventListener('change', (e) => {
    chrome.storage.local.set({ startDate: e.target.value });
  });

  document.getElementById('endDate').addEventListener('change', (e) => {
    chrome.storage.local.set({ endDate: e.target.value });
  });

  // Load and show total requests from dashboard when popup opens
  (async () => {
    const valueEl = document.getElementById('totalRequestsValue');
    const sectionEl = document.getElementById('totalRequestsSection');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const isDashboard = tab?.url && tab.url.includes('console.cloud.google.com/apis/dashboard');
      if (!isDashboard || !tab?.id) {
        valueEl.textContent = 'Open dashboard to see total';
        return;
      }
      chrome.tabs.sendMessage(tab.id, { action: 'getTotalRequests' }, (response) => {
        if (chrome.runtime.lastError) {
          valueEl.textContent = 'Reload dashboard tab';
          return;
        }
        const total = response?.total;
        if (typeof total === 'number' && total >= 0) {
          valueEl.textContent = total.toLocaleString();
        } else {
          valueEl.textContent = '—';
        }
      });
    } catch (_) {
      valueEl.textContent = '—';
    }
  })();
