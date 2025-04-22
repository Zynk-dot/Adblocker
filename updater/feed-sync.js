(async function () {
    const sources = {
        openPhish: 'https://openphish.com/feed.txt'
        // More sources can be added here later
    };

    const fetchedDomains = new Set();

    const fetchFeeds = async () => {
        for (const [name, url] of Object.entries(sources)) {
            try {
                const res = await fetch(url);
                const text = await res.text();
                const lines = text.split('\n').filter(Boolean);

                lines.forEach(line => {
                    try {
                        const hostname = new URL(line).hostname;
                        fetchedDomains.add(hostname);
                    } catch (e) {
                        // Not a valid URL – maybe it's already a domain
                        if (line.length > 4) fetchedDomains.add(line.trim());
                    }
                });

                console.log(`[Feed Sync] ${name} fetched: ${lines.length} lines`);
            } catch (err) {
                console.warn(`[Feed Sync] Failed to fetch ${name}:`, err);
            }
        }

        // Write new cache
        const cache = {
            domains: [...fetchedDomains],
            lastUpdated: new Date().toISOString()
        };

        await chrome.storage.local.set({ threatFeeds: cache });
        console.log('[Feed Sync] Threat feed cache updated');
    };

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === 'syncThreatFeeds') fetchFeeds();
    });

    fetchFeeds(); // Run once on load
})();
