(() => {
    const isPixelTracker = el => {
      const src = el.getAttribute('src') || '';
      const width = el.offsetWidth || el.width || 0;
      const height = el.offsetHeight || el.height || 0;
  
      return (
        (width <= 5 && height <= 5) ||
        src.includes('pixel') ||
        /\/ads\/|track|analytics|beacon/i.test(src) ||
        el.className?.toLowerCase().includes('track')
      );
    };
  
    const neutralize = el => {
      if (!el || el.hasAttribute('data-neutralized')) return;
      el.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      el.setAttribute('data-neutralized', 'true');
      logEvent('Tracking Pixel Blocked', el.outerHTML);
    };
  
    const logEvent = (type, detail) => {
      chrome.storage.local.get('logEvents', data => {
        const logs = data.logEvents || [];
        logs.push({ time: Date.now(), type, detail, module: 'tracking-neutralizer' });
        chrome.storage.local.set({ logEvents: logs.slice(-500) });
      });
    };
  
    const scanAll = () => {
      document.querySelectorAll('img, iframe').forEach(el => {
        if (isPixelTracker(el)) {
          neutralize(el);
        }
      });
    };
  
    const observeDOM = () => {
      const target = document.body;
      if (!target) return;
  
      const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
          mutation.addedNodes.forEach(node => {
            if (node.tagName === 'IMG' || node.tagName === 'IFRAME') {
              if (isPixelTracker(node)) {
                neutralize(node);
              }
            } else if (node.querySelectorAll) {
              node.querySelectorAll('img, iframe').forEach(el => {
                if (isPixelTracker(el)) neutralize(el);
              });
            }
          });
        }
      });
  
      observer.observe(target, { childList: true, subtree: true });
    };
  
    const init = () => {
      scanAll();
      observeDOM();
      console.log('[Tracking Neutralizer] Pixel beacon kill switch active 🎯');
    };
  
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
  