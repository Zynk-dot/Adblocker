(() => {
    const logEvent = (type, detail, module = 'payload-inspector') => {
      chrome.storage.local.get('logEvents', data => {
        const logs = data.logEvents || [];
        logs.push({ time: Date.now(), type, detail, module });
        chrome.storage.local.set({ logEvents: logs.slice(-500) });
      });
    };
  
    const safeWrap = (fnName, handler) => {
      const original = window[fnName];
      window[fnName] = new Proxy(original, {
        apply(target, thisArg, args) {
          if (typeof args[0] === 'string') {
            logEvent(`${fnName} blocked`, args[0]);
            return handler();
          }
          return Reflect.apply(target, thisArg, args);
        }
      });
    };
  
    const wrapFunctionConstructor = () => {
      const OriginalFunction = Function;
      window.Function = new Proxy(OriginalFunction, {
        construct(target, args) {
          const payload = args.join(',');
          logEvent('Function blocked', payload);
          return () => {};
        }
      });
    };
  
    // Apply protections
    safeWrap('eval', () => undefined);
    safeWrap('setTimeout', () => null);
    safeWrap('setInterval', () => null);
    wrapFunctionConstructor();
  
    console.log('[Payload Inspector] Hooks active – JS execution traps armed 💣');
  })();
  