document.getElementById('translate-image-btn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'initiateImageSelection' });
        window.close();
    });
});

document.getElementById('translate-page-btn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const pageUrl = encodeURIComponent(tabs[0].url);
        const googleTranslateUrl = `https://translate.google.com/translate?sl=auto&tl=vi&u=${pageUrl}`;
        chrome.tabs.create({ url: googleTranslateUrl });
        window.close();
    });
});

document.getElementById('options-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
});