(() => {
    const waitForDOM = () =>
      new Promise(resolve => {
        if (document.documentElement) return resolve(document.documentElement);
        const observer = new MutationObserver(() => {
          if (document.documentElement) {
            observer.disconnect();
            resolve(document.documentElement);
          }
        });
        observer.observe(document, { childList: true });
      });
  
    const loadStealthModules = async () => {
      const [config, stored] = await Promise.all([
        fetch(chrome.runtime.getURL('stealth/stealth-config.json')).then(r => r.json()).catch(() => ({})),
        new Promise(res => chrome.storage.local.get(['safeDomains'], res))
      ]);
  
      const currentHost = location.hostname;
      const safeList = stored.safeDomains || [];
      if (safeList.some(domain => currentHost.includes(domain))) {
        console.log('[Stealth] Skipped on safe domain:', currentHost);
        return;
      }
  
      const modules = [
        { enabled: config.fingerprintSpoof, path: 'stealth/fingerprint-spoof.js' },
        { enabled: config.navigatorCloak, path: 'stealth/navigator-cloak.js' },
        { enabled: config.adblockBait, path: 'stealth/adblock-bait.js' },
        { enabled: config.spoofTweaks, path: 'stealth/spoof-tweaks.js' }
      ];
  
      const root = await waitForDOM();
  
      for (const mod of modules) {
        if (!mod.enabled) continue;
        try {
          const script = document.createElement('script');
          script.src = chrome.runtime.getURL(mod.path);
          script.type = 'module';
          root.appendChild(script);
          console.log(`[Stealth] Loaded: ${mod.path}`);
        } catch (err) {
          console.warn(`[Stealth] Failed to load ${mod.path}`, err);
        }
      }
    };
  
    loadStealthModules();
  })();
  