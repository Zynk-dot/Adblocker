(async function () {
    const updateRules = async () => {
        const rulesUrl = chrome.runtime.getURL('filters/dynamic-rules.json');
        const rules = await fetch(rulesUrl).then(res => res.json()).catch(() => []);

        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: rules.map(r => r.id),
            addRules: rules
        }, () => {
            console.log(`[Rule Manager] Loaded ${rules.length} DNR rules`);
        });
    };

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === 'updateRules') updateRules();
    });

    updateRules();
})();
