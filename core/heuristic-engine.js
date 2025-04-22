(function () {
    const suspiciousNodes = [];

    const isSuspicious = el => {
        const style = window.getComputedStyle(el);
        const w = el.offsetWidth;
        const h = el.offsetHeight;

        const isBeacon = w < 10 && h < 10;
        const suspiciousAttrs = /(ads|track|sponsor|analytics)/i;
        const idClass = el.id + ' ' + el.className;

        return (
            isBeacon ||
            suspiciousAttrs.test(idClass) ||
            el.tagName === 'IFRAME' && (el.src.includes('ads') || el.src.length > 100)
        );
    };

    const scanDOM = () => {
        const elements = document.querySelectorAll('iframe, img, script, div');
        elements.forEach(el => {
            if (isSuspicious(el)) {
                el.remove();
                suspiciousNodes.push(el);
            }
        });

        if (suspiciousNodes.length > 0) {
            console.warn(`[Heuristic Engine] Removed ${suspiciousNodes.length} suspicious nodes`);
        }
    };

    const observer = new MutationObserver(() => scanDOM());
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('DOMContentLoaded', scanDOM);
    console.log('[Heuristic Engine] DOM scanner initialized 🔎');
})();
