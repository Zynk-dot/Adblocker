(function () {
    // === Canvas Fingerprinting Spoof ===
    const overrideCanvas = () => {
        const toDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function (...args) {
            const context = this.getContext('2d');
            if (context) {
                context.fillStyle = '#FF00FF';
                context.fillRect(0, 0, 10, 10);
            }
            return toDataURL.apply(this, args);
        };

        const getImageData = CanvasRenderingContext2D.prototype.getImageData;
        CanvasRenderingContext2D.prototype.getImageData = function (...args) {
            const imageData = getImageData.apply(this, args);
            for (let i = 0; i < imageData.data.length; i++) {
                imageData.data[i] ^= 1;
            }
            return imageData;
        };
    };

    // === WebGL Spoofing ===
    const overrideWebGL = () => {
        const gl = WebGLRenderingContext.prototype;
        const fakeValue = 'AdblockerProGPU';
        gl.getParameter = new Proxy(gl.getParameter, {
            apply: (target, thisArg, args) => {
                const param = args[0];
                if (param === 37445 || param === 37446) return fakeValue; // VENDOR/RENDERER
                return Reflect.apply(target, thisArg, args);
            }
        });
    };

    // === Audio Fingerprint Noise ===
    const overrideAudio = () => {
        const AudioCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (!AudioCtx) return;

        const original = AudioCtx.prototype.startRendering;
        AudioCtx.prototype.startRendering = function (...args) {
            const render = original.apply(this, args);
            render.then(buffer => {
                const channelData = buffer.getChannelData(0);
                for (let i = 0; i < channelData.length; i++) {
                    channelData[i] += Math.random() * 0.00001;
                }
            });
            return render;
        };
    };

    overrideCanvas();
    overrideWebGL();
    overrideAudio();

    console.log('[Stealth] Fingerprint spoofing fully active');
})();
