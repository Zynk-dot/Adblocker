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
      const configUrl = chrome.runtime.getURL('stealth/stealth-config.json');
      const config = await fetch(configUrl).then(r => r.json()).catch(() => ({}));
  
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
          script.async = false;
          root.appendChild(script);
          console.log(`[Stealth] Loaded: ${mod.path}`);
        } catch (err) {
          console.warn(`[Stealth] Failed to load ${mod.path}`, err);
        }
      }
    };
  
    loadStealthModules();
  })();
  