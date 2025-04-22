(() => {
  const isPixelTracker = el => {
    const src = el.getAttribute('src') || '';
    const width = el.naturalWidth || el.width || 0;
    const height = el.naturalHeight || el.height || 0;

    return (
      (width <= 1 && height <= 1) ||
      src.includes('pixel') ||
      /\/ads\/|track|analytics/i.test(src)
    );
  };

  const neutralize = el => {
    if (!el || el.hasAttribute('data-neutralized')) return;
    el.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    el.setAttribute('data-neutralized', 'true');
    chrome.storage.local.get('logEvents', data => {
      const logs = data.logEvents || [];
      logs.push({
        time: Date.now(),
        type: 'Tracking Pixel Blocked',
        detail: el.outerHTML,
        module: 'tracking-neutralizer'
      });
      chrome.storage.local.set({ logEvents: logs.slice(-500) });
    });
  };

  const observeDOM = () => {
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          if (node.tagName === 'IMG' || node.tagName === 'IFRAME') {
            if (isPixelTracker(node)) neutralize(node);
          } else if (node.querySelectorAll) {
            node.querySelectorAll('img, iframe').forEach(el => {
              if (isPixelTracker(el)) neutralize(el);
            });
          }
        });
      }
    });

    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    else window.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  };

  const scanAll = () => {
    document.querySelectorAll('img, iframe').forEach(el => {
      if (isPixelTracker(el)) neutralize(el);
    });
  };

  scanAll();
  observeDOM();
  console.log('[Tracking Neutralizer] Pixel beacon kill switch active 🎯');
})();
