(async function () {
    const signatures = await fetch(chrome.runtime.getURL('core/script-signatures.json'))
        .then(res => res.json()).catch(() => []);

    const scanScript = (scriptContent) => {
        for (const sig of signatures) {
            const regex = new RegExp(sig.pattern, 'i');
            if (regex.test(scriptContent)) {
                console.warn(`[Script Detector] Matched "${sig.name}" → Threat: ${sig.threat}`);
                // Optional: remove or replace node if needed
                return true;
            }
        }
        return false;
    };

    const scanAllInlineScripts = () => {
        const scripts = document.querySelectorAll('script:not([src])');
        scripts.forEach(script => {
            const code = script.textContent || '';
            if (scanScript(code)) {
                script.remove();
            }
        });
    };

    const observeNewScripts = () => {
        const observer = new MutationObserver(mutations => {
            for (const m of mutations) {
                m.addedNodes.forEach(node => {
                    if (node.tagName === 'SCRIPT' && !node.src) {
                        const code = node.textContent || '';
                        if (scanScript(code)) {
                            node.remove();
                        }
                    }
                });
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    };

    scanAllInlineScripts();
    observeNewScripts();
    console.log('[Script Detector] Inline JS monitoring active');
})();
