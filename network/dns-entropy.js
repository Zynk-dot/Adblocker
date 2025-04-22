(() => {
    const ENTROPY_THRESHOLD = 4.0;
    const SUBDOMAIN_MIN_LENGTH = 15;
    let threatDomains = new Set();
  
    // === UTIL: Calculate Shannon entropy ===
    const entropy = str => {
      const map = {};
      for (let char of str) map[char] = (map[char] || 0) + 1;
      return Object.values(map).reduce((acc, freq) => {
        const p = freq / str.length;
        return acc - p * Math.log2(p);
      }, 0);
    };
  
    const logEvent = (type, detail) => {
      chrome.storage.local.get('logEvents', data => {
        const logs = data.logEvents || [];
        logs.push({ time: Date.now(), type, detail, module: 'dns-entropy' });
        chrome.storage.local.set({ logEvents: logs.slice(-500) });
      });
    };
  
    const analyzeURL = url => {
      try {
        const { hostname } = new URL(url);
        const subdomain = hostname.split('.').slice(0, -2).join('.');
        const ent = entropy(subdomain);
  
        if (threatDomains.has(hostname)) {
          console.error(`[Threat Feed] Blocked or flagged: ${hostname}`);
          logEvent('Threat Feed Match', hostname);
          return;
        }
  
        if (ent > ENTROPY_THRESHOLD && subdomain.length > SUBDOMAIN_MIN_LENGTH) {
          console.warn(`[Entropy] Suspicious domain detected: ${hostname} (entropy: ${ent.toFixed(2)})`);
          logEvent('High Entropy Domain', hostname);
        }
      } catch (e) {
        // Invalid URL — ignore
      }
    };
  
    // === LOAD THREAT DOMAINS ===
    chrome.storage.local.get('threatFeeds', data => {
      if (data.threatFeeds?.domains) {
        threatDomains = new Set(data.threatFeeds.domains);
        console.log(`[DNS Entropy] Loaded ${threatDomains.size} threat domains from cache`);
      }
    });
  
    // === HOOK: fetch() ===
    const hookFetch = () => {
      const original = window.fetch;
      window.fetch = new Proxy(original, {
        apply: (target, thisArg, args) => {
          if (args[0]) analyzeURL(args[0].url || args[0]);
          return Reflect.apply(target, thisArg, args);
        }
      });
    };
  
    // === HOOK: XMLHttpRequest ===
    const hookXHR = () => {
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        analyzeURL(url);
        return originalOpen.call(this, method, url, ...rest);
      };
    };
  
    // === HOOK: navigator.sendBeacon ===
    const hookBeacon = () => {
      const original = navigator.sendBeacon;
      navigator.sendBeacon = function (url, data) {
        analyzeURL(url);
        return original.apply(this, arguments);
      };
    };
  
    // === HOOK: Element.setAttribute (src) ===
    const hookElementSrc = () => {
      const originalSet = Element.prototype.setAttribute;
      Element.prototype.setAttribute = function (attr, val) {
        if (['img', 'script', 'iframe'].includes(this.tagName?.toLowerCase()) && attr === 'src') {
          analyzeURL(val);
        }
        return originalSet.call(this, attr, val);
      };
    };
  
    // === START MONITORING ===
    const init = () => {
      hookFetch();
      hookXHR();
      hookBeacon();
      hookElementSrc();
      console.log('[DNS Entropy] Network analysis hooks armed');
    };
  
    // Wait for body (if needed)
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
  