chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'refreshSettings') {
      // Optional: re-trigger any toggled scripts if needed
      console.log('[Content] Received refreshSettings');
    }
  });
  