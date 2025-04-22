(function () {
    const fakeTimezones = ['UTC', 'Europe/London', 'Asia/Singapore', 'America/New_York'];
    const randomTimezone = fakeTimezones[Math.floor(Math.random() * fakeTimezones.length)];

    Intl.DateTimeFormat.prototype.resolvedOptions = new Proxy(Intl.DateTimeFormat.prototype.resolvedOptions, {
        apply: (target, thisArg, args) => {
            const options = Reflect.apply(target, thisArg, args);
            options.timeZone = randomTimezone;
            return options;
        }
    });

    Object.defineProperty(screen, 'width', { get: () => 1920 });
    Object.defineProperty(screen, 'height', { get: () => 1080 });
    Object.defineProperty(screen, 'colorDepth', { get: () => 24 });

    console.log('[Stealth] Timezone spoofed to:', randomTimezone);
})();
