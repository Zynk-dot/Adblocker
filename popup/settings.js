document.addEventListener('DOMContentLoaded', () => {
    const SETTINGS_KEYS = {
      stealth: 'stealthToggle',
      payload: 'payloadToggle',
      heuristics: 'heuristicsToggle',
      csp: 'cspToggle',
      entropy: 'entropyToggle',
      trackingKill: 'trackingToggle'
    };
  
    const safeDomainsField = document.getElementById('safeDomains');
    const updateBtn = document.getElementById('updateFiltersBtn');
  
    chrome.storage.local.get({ ...SETTINGS_KEYS, safeDomains: [] }, data => {
      for (const [key, id] of Object.entries(SETTINGS_KEYS)) {
        const el = document.getElementById(id);
        if (el && key in data) el.checked = data[key];
      }
  
      safeDomainsField.value = (data.safeDomains || []).join('\n');
  
      chrome.storage.local.get('threatFeeds', res => {
        const updated = res.threatFeeds?.lastUpdated;
        document.getElementById('lastUpdated').textContent =
          updated ? `Last updated: ${new Date(updated).toLocaleString()}` : 'No updates yet';
      });
    });
  
    for (const [key, id] of Object.entries(SETTINGS_KEYS)) {
      const el = document.getElementById(id);
      el?.addEventListener('change', () => {
        chrome.storage.local.set({ [key]: el.checked });
      });
    }
  
    safeDomainsField?.addEventListener('input', () => {
      const lines = safeDomainsField.value.split('\n').map(x => x.trim()).filter(Boolean);
      chrome.storage.local.set({ safeDomains: lines });
    });
  
    updateBtn?.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'syncThreatFeeds' });
      chrome.runtime.sendMessage({ action: 'updateRules' });
      alert('Filter update started!');
    });
  });
  