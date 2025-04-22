document.addEventListener('DOMContentLoaded', () => {
    const blockedEl = document.getElementById('blocked-count');
    const threatsEl = document.getElementById('threats-count');
  
    chrome.storage.local.get(['blockedCount', 'threatsDetected', 'stealth', 'heuristics', 'payload'], data => {
      blockedEl.textContent = data.blockedCount || 0;
      threatsEl.textContent = data.threatsDetected || 0;
  
      document.getElementById('stealthToggle').checked = data.stealth ?? true;
      document.getElementById('heuristicsToggle').checked = data.heuristics ?? true;
      document.getElementById('payloadToggle').checked = data.payload ?? true;
    });
  
    const syncToggle = (id, key) => {
      const el = document.getElementById(id);
      el?.addEventListener('change', () => {
        chrome.storage.local.set({ [key]: el.checked });
      });
    };
  
    syncToggle('stealthToggle', 'stealth');
    syncToggle('heuristicsToggle', 'heuristics');
    syncToggle('payloadToggle', 'payload');
  
    document.getElementById('updateFilters')?.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'syncThreatFeeds' });
      chrome.runtime.sendMessage({ action: 'updateRules' });
      alert('Filter update started!');
    });
  
    document.getElementById('viewLogs')?.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('popup/logs.html') });
    });
  
    document.getElementById('openSettingsBtn')?.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('popup/settings.html') });
    });
  });
  