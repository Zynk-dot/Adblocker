(function () {
    const spoof = {
        languages: ['en-US', 'en'],
        platform: 'Win32',
        webdriver: false,
        hardwareConcurrency: 4,
        deviceMemory: 8,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/117.0.0.0 Safari/537.36'
    };

    for (const key in spoof) {
        if (navigator[key] !== undefined) {
            try {
                Object.defineProperty(navigator, key, {
                    get: () => spoof[key],
                    configurable: true
                });
            } catch (err) {
                console.warn(`[Stealth] Could not spoof navigator.${key}`);
            }
        }
    }

    Object.defineProperty(navigator, 'plugins', {
        get: () => [{ name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' }],
        configurable: true
    });

    Object.defineProperty(navigator, 'mimeTypes', {
        get: () => [{ type: 'application/pdf', suffixes: 'pdf', description: '', enabledPlugin: {} }],
        configurable: true
    });

    console.log('[Stealth] Navigator cloaking active');
})();
