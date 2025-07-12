
// --- INITIALIZATION ---
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ 
        savedWords: [],
        lookupHistory: [] 
    });
    chrome.contextMenus.create({
        id: "smart-lookup-pro",
        title: "Tra cứu thông minh: \"%s\"",
        contexts: ["selection"]
    });
});

// --- EVENT LISTENERS ---
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "smart-lookup-pro" && info.selectionText) {
        chrome.tabs.sendMessage(tab.id, { action: 'showPopupFromContextMenu', text: info.selectionText });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'smartLookup':
            handleSmartLookup(request.text).then(sendResponse);
            break;
        case 'aiAnalyze':
            handleAiAnalysis(request.text).then(sendResponse);
            break;
        case 'translateImage':
            handleImageTranslation(request.imageData).then(sendResponse);
            break;
        case 'speak':
            chrome.tts.speak(request.text, { lang: 'en-US', rate: 1.0 });
            break;
        case 'toggleSaveWord':
            toggleSaveWord(request.word).then(sendResponse);
            break;
        case 'openOptionsPage':
            chrome.runtime.openOptionsPage();
            break;
        case 'getSavedWords': getSavedWords().then(sendResponse); break;
        case 'deleteSavedWord': deleteSavedWord(request.word).then(sendResponse); break;
        case 'getLookupHistory': getLookupHistory().then(sendResponse); break;
        case 'clearLookupHistory': clearLookupHistory().then(sendResponse); break;
        case 'captureVisibleTab':
             chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
                if (chrome.runtime.lastError) {
                    sendResponse({ error: chrome.runtime.lastError.message });
                } else {
                    sendResponse({ imageData: dataUrl });
                }
            });
            break;
    }
    return true;
});

// --- CORE LOGIC ---
async function handleSmartLookup(text) {
    await saveToHistory(text);
    const wordCount = text.trim().split(/\s+/).length;
    const isSaved = await isWordSaved(text);
    let result = (wordCount === 1) ? await getDefinition(text) : await getTranslation(text);
    if (result.success) result.isSaved = isSaved;
    return result;
}

// --- AI & OCR ---
async function handleAiAnalysis(text) {
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const prompt = `Analyze the English word or phrase: "${text}". Provide a concise analysis in Vietnamese. Return ONLY a valid JSON object with this exact structure: {"explanation": "string", "synonyms": ["string"], "antonyms": ["string"], "examples": [{"en": "string", "vi": "string"}]}. If a field is not applicable, return an empty array [] or empty string.`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const result = await response.json();
        const jsonText = result.candidates[0].content.parts[0].text;
        return { success: true, data: JSON.parse(jsonText) };
    } catch (error) {
        return { success: false, error: "Phân tích AI không thành công." };
    }
}

async function handleImageTranslation(imageData) {
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const prompt = "Read all the text in this image and translate it to Vietnamese. Provide only the translated text, nothing else.";

    const payload = {
        contents: [{
            parts: [
                { text: prompt },
                { inline_data: { mime_type: "image/png", data: imageData.split(',')[1] } }
            ]
        }]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const result = await response.json();
        const translatedText = result.candidates[0].content.parts[0].text;
        return { success: true, text: translatedText };
    } catch (error) {
        return { success: false, error: "Không thể dịch ảnh." };
    }
}


// --- API FETCHING ---
async function getDefinition(word) {
    try {
        const [defResponse, transResponse] = await Promise.all([
            fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`),
            fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`)
        ]);
        if (!defResponse.ok) {
            if (defResponse.status === 404) return getTranslation(word);
            throw new Error(`API dictionary error! status: ${defResponse.status}`);
        }
        const defData = await defResponse.json();
        const transData = await transResponse.json();
        const translationText = (transResponse.ok && transData.responseStatus === 200) ? transData.responseData.translatedText : null;
        return { success: true, type: 'definition', data: defData[0], translation: translationText };
    } catch (error) {
        return getTranslation(word);
    }
}

async function getTranslation(text) {
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`);
        if (!response.ok) throw new Error(`API translation error! status: ${response.status}`);
        const data = await response.json();
        if (data.responseStatus !== 200) throw new Error(`Translation failed: ${data.responseDetails}`);
        return { success: true, type: 'translation', data: data.responseData };
    } catch (error) {
        return { success: false, error: 'Không thể dịch được văn bản này.' };
    }
}

// --- STORAGE MANAGEMENT ---
async function getFromStorage(key) {
    const result = await chrome.storage.local.get(key);
    return result[key] || [];
}
async function saveToHistory(text) {
    let history = await getFromStorage('lookupHistory');
    const lowerCaseText = text.toLowerCase();
    history = history.filter(item => item !== lowerCaseText);
    history.unshift(lowerCaseText);
    if (history.length > 50) history.pop();
    await chrome.storage.local.set({ lookupHistory: history });
}
async function getLookupHistory() { return await getFromStorage('lookupHistory'); }
async function clearLookupHistory() {
    await chrome.storage.local.set({ lookupHistory: [] });
    return { success: true };
}
async function getSavedWords() { return await getFromStorage('savedWords'); }
async function isWordSaved(word) {
    const savedWords = await getSavedWords();
    return savedWords.includes(word.toLowerCase());
}
async function toggleSaveWord(word) {
    const lowerCaseWord = word.toLowerCase();
    let savedWords = await getFromStorage('savedWords');
    const wordIndex = savedWords.indexOf(lowerCaseWord);
    if (wordIndex > -1) savedWords.splice(wordIndex, 1);
    else savedWords.push(lowerCaseWord);
    await chrome.storage.local.set({ savedWords: savedWords });
    return { isSaved: wordIndex === -1 };
}
async function deleteSavedWord(word) {
    let savedWords = await getFromStorage('savedWords');
    const updatedWords = savedWords.filter(w => w !== word.toLowerCase());
    await chrome.storage.local.set({ savedWords: updatedWords });
    return { success: true };
}