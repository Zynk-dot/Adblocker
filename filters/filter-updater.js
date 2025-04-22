(async function () {
    const easyListURLs = [
        'https://easylist.to/easylist/easylist.txt',
        'https://easylist.to/easylist/easyprivacy.txt'
    ];

    const fetchList = async (url) => {
        try {
            const res = await fetch(url);
            const text = await res.text();
            console.log(`[FilterUpdater] Fetched ${url}`);
            return text.split('\n').filter(line => line.trim() && !line.startsWith('!'));
        } catch (err) {
            console.error(`[FilterUpdater] Failed to fetch ${url}`, err);
            return [];
        }
    };

    const parseEasyListToDNR = (lines, startId = 1000) => {
        const rules = [];
        let id = startId;

        const isBlockingRule = line =>
            !line.includes('##') && !line.includes('#@#') && !line.includes('@@') && line.includes('||');

        const extractDomain = line => {
            try {
                return line
                    .replace(/^(\|\|)/, '')      // Remove leading ||
                    .replace(/\^$/, '')          // Remove trailing ^
                    .replace(/[\*\^].*$/, '')    // Strip wildcards
                    .split('/')[0];              // Strip URL path
            } catch (e) {
                return null;
            }
        };

        for (const line of lines) {
            if (!isBlockingRule(line)) continue;

            const domain = extractDomain(line);
            if (!domain) continue;

            rules.push({
                id: id++,
                priority: 1,
                action: { type: 'block' },
                condition: {
                    urlFilter: domain,
                    resourceTypes: ['script', 'sub_frame', 'xmlhttprequest', 'image']
                }
            });
        }

        return rules;
    };

    const mergeWithThreatFeed = async (dnrRules, startId = 100000) => {
        const storage = await chrome.storage.local.get('threatFeeds');
        const threatFeeds = storage.threatFeeds || {};
        const threatDomains = threatFeeds.domains || [];

        const rules = [];
        let id = startId;

        for (const domain of threatDomains) {
            rules.push({
                id: id++,
                priority: 1,
                action: { type: 'block' },
                condition: {
                    urlFilter: domain,
                    resourceTypes: ['script', 'image', 'sub_frame', 'xmlhttprequest']
                }
            });
        }

        return [...dnrRules, ...rules];
    };

    const allRules = [];
    for (const url of easyListURLs) {
        const rawList = await fetchList(url);
        const parsedRules = parseEasyListToDNR(rawList);
        allRules.push(...parsedRules);
    }

    const finalRules = await mergeWithThreatFeed(allRules);
    const blob = new Blob([JSON.stringify(finalRules, null, 2)], { type: 'application/json' });

    const fileUrl = URL.createObjectURL(blob);

    // Optional: Save to filters/dynamic-rules.json if using DevTools file system mapping
    const response = await fetch(fileUrl);
    const json = await response.json();

    await chrome.storage.local.set({ dynamicRules: json });
    console.log(`[FilterUpdater] Loaded ${json.length} total blocking rules`);

    chrome.runtime.sendMessage({ action: "updateRules" }); // trigger reload
})();
