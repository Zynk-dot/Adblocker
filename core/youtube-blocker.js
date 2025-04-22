(() => {
    const removeAdContainers = () => {
      const selectors = [
        '.ytp-ad-module',
        '#player-ads',
        '.ytp-ad-overlay-container',
        '.ytp-ad-player-overlay',
        '.video-ads'
      ];
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
      });
    };
  
    const observer = new MutationObserver(() => {
      removeAdContainers();
    });
  
    observer.observe(document, { childList: true, subtree: true });
    removeAdContainers();
  })();
  