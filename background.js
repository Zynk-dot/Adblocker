chrome.runtime.onInstalled.addListener(() => {
    console.log('[Background] Installed – setting up alarms');
    chrome.alarms.create('syncRules', { periodInMinutes: 1440 });
    chrome.alarms.create('rotateLogs', { periodInMinutes: 60 });
  });
  
  chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === 'syncRules') {
      chrome.runtime.sendMessage({ action: 'syncThreatFeeds' });
      chrome.runtime.sendMessage({ action: 'updateRules' });
      console.log('[Background] Auto-sync triggered');
    }
  
    if (alarm.name === 'rotateLogs') {
      chrome.storage.local.get('logEvents', data => {
        const logs = (data.logEvents || []).slice(-500);
        chrome.storage.local.set({ logEvents: logs });
        console.log('[Background] Logs rotated');
      });
    }
  });
  
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'syncThreatFeeds') {
      import('./updater/feed-sync.js').then(() => {
        console.log('[Background] Feed sync complete');
        sendResponse({ status: 'done' });
      }).catch(err => {
        console.error('[Background] Feed sync failed', err);
        sendResponse({ status: 'error' });
      });
      return true;
    }
  
    if (msg.action === 'updateRules') {
      chrome.storage.local.get('dynamicRules', data => {
        const rules = data.dynamicRules || [];
        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: rules.map((_, i) => i + 1),
          addRules: rules.map((r, i) => ({ ...r, id: i + 1 }))
        }, () => {
          console.log(`[Background] ${rules.length} rules updated`);
          sendResponse({ status: 'done' });
        });
      });
      return true;
    }
  });
  