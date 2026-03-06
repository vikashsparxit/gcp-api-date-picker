document.getElementById('applyBtn').addEventListener('click', () => {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    const pageState = `("duration":("groupValue":null,"customValue":("start":"${startDate}","end":"${endDate}")))`;
    const url = `https://console.cloud.google.com/apis/dashboard?pageState=${encodeURIComponent(pageState)}`;
    
    chrome.tabs.update({ url: url });
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
  