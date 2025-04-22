(function () {
    const bait = document.createElement('div');
    bait.className = 'adsbox ad-banner sponsored';
    bait.style = `
        width: 1px !important;
        height: 1px !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
        display: block !important;
        visibility: visible !important;
        pointer-events: none !important;
    `;
    bait.innerHTML = '&nbsp;';
    document.body.appendChild(bait);

    setTimeout(() => {
        if (!document.body.contains(bait)) {
            console.warn('[Stealth] Ad bait removed – anti-adblock active');
        }
    }, 1000);

    console.log('[Stealth] Adblock bait injected');
})();
