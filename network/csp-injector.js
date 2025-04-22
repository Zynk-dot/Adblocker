(() => {
    // Only inject on the extension's own UI pages (popup/settings/logs)
    if (!location.href.startsWith(chrome.runtime.getURL(''))) {
      return;
    }
  
    const waitForHead = () =>
      new Promise(resolve => {
        if (document.head) return resolve(document.head);
        const observer = new MutationObserver(() => {
          if (document.head) {
            observer.disconnect();
            resolve(document.head);
          }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
      });
  
    const injectCSP = async () => {
      const useCSP = await new Promise(res =>
        chrome.storage.local.get('csp', data => res(data.csp ?? true))
      );
      if (!useCSP) return;
  
      const head = await waitForHead();
  
      if (document.querySelector('meta[http-equiv="Content-Security-Policy"]')) return;
  
      const meta = document.createElement('meta');
      meta.httpEquiv = "Content-Security-Policy";
      meta.content = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src * data: blob:",
        "connect-src *",
        "object-src 'none'"
      ].join('; ');
  
      head.appendChild(meta);
      console.log('[CSP Injector] Local extension CSP injected');
    };
  
    injectCSP();
  })();
  