(function () {
    const installChip = document.getElementById('install-chip');
    const installButton = document.getElementById('install-app-button');
    const installText = document.getElementById('install-app-text');

    if (!installChip || !installButton || !installText) {
        return;
    }

    let deferredPrompt = null;

    const isStandalone = () =>
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;

    const isIos = () =>
        /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    const showChip = (buttonLabel, text) => {
        installButton.textContent = buttonLabel;
        installText.textContent = text;
        installChip.classList.add('is-visible');
    };

    const hideChip = () => {
        installChip.classList.remove('is-visible');
    };

    const refreshInstallUi = () => {
        if (isStandalone()) {
            hideChip();
            return;
        }

        if (deferredPrompt) {
            showChip('Install', 'Install on this device for quick launch.');
            return;
        }

        if (isIos()) {
            showChip('Share', 'On iPhone or iPad, use Share > Add to Home Screen.');
            return;
        }

        hideChip();
    };

    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            deferredPrompt = null;
            if (choiceResult.outcome === 'accepted') {
                hideChip();
            } else {
                refreshInstallUi();
            }
            return;
        }

        if (isIos()) {
            showChip('Share', 'Tap Share, then Add to Home Screen to install.');
        }
    });

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt = event;
        refreshInstallUi();
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        hideChip();
    });

    window.addEventListener('load', () => {
        if ('serviceWorker' in navigator && window.isSecureContext) {
            navigator.serviceWorker.register('./sw.js').catch((error) => {
                console.warn('Service worker registration failed:', error);
            });
        }

        refreshInstallUi();
    });
})();
