document.addEventListener('DOMContentLoaded', () => {
    const SETTINGS_KEYS = {
      stealth: 'stealthToggle',
      payload: 'payloadToggle',
      heuristics: 'heuristicsToggle',
      csp: 'cspToggle',
      entropy: 'entropyToggle',
      trackingKill: 'trackingToggle'
    };
  
    const updateUI = settings => {
      for (const [key, id] of Object.entries(SETTINGS_KEYS)) {
        const el = document.getElementById(id);
        if (el && key in settings) el.checked = settings[key];
      }
  
      // Threat feed last updated
      chrome.storage.local.get('threatFeeds', res => {
        const updated = res.threatFeeds?.lastUpdated;
        document.getElementById('lastUpdated').textContent =
          updated
            ? `Last updated: ${new Date(updated).toLocaleString()}`
            : 'No updates yet';
      });
    };
  
    chrome.storage.local.get(Object.keys(SETTINGS_KEYS), updateUI);
  
    for (const [key, id] of Object.entries(SETTINGS_KEYS)) {
      const el = document.getElementById(id);
      el?.addEventListener('change', () => {
        chrome.storage.local.set({ [key]: el.checked });
      });
    }
  
    const updateBtn = document.getElementById('updateFiltersBtn');
    updateBtn?.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'syncThreatFeeds' });
      chrome.runtime.sendMessage({ action: 'updateRules' });
      alert('Update initiated!');
    });
  });
  