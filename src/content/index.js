let selectedText = "";
let mainPopup = null;
let triggerIcon = null;

// --- EVENT LISTENERS ---
document.addEventListener("mouseup", (e) => {
    if ((mainPopup && mainPopup.contains(e.target)) || (triggerIcon && triggerIcon.contains(e.target))) return;
    setTimeout(() => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        if (text.length > 0 && text.length < 1000) {
            selectedText = text;
            if (!triggerIcon) createTriggerIcon();
            positionTriggerIcon(selection.getRangeAt(0));
        } else {
            hideTriggerIcon();
            hidePopup();
        }
    }, 10);
});

document.addEventListener("mousedown", (e) => {
    if (mainPopup && !mainPopup.contains(e.target) && triggerIcon && !triggerIcon.contains(e.target)) {
        hidePopup();
        hideTriggerIcon();
    }
});

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'showPopupFromContextMenu') {
        selectedText = request.text;
        showPopup(document.createRange().getBoundingClientRect(), true);
    } else if (request.action === 'initiateImageSelection') {
        initiateImageSelection();
    }
});


// --- IMAGE SELECTION (OCR) ---
function initiateImageSelection() {
    const overlay = document.createElement('div');
    overlay.id = 'ela-ocr-overlay';
    document.body.appendChild(overlay);

    const selectionBox = document.createElement('div');
    selectionBox.id = 'ela-ocr-selection';
    overlay.appendChild(selectionBox);

    let startX, startY, isDrawing = false;

    overlay.onmousedown = (e) => {
        startX = e.clientX;
        startY = e.clientY;
        selectionBox.style.left = `${startX}px`;
        selectionBox.style.top = `${startY}px`;
        selectionBox.style.width = '0px';
        selectionBox.style.height = '0px';
        isDrawing = true;
        overlay.appendChild(selectionBox);
        selectionBox.style.display = 'block';
    };

    overlay.onmousemove = (e) => {
        if (!isDrawing) return;
        const width = e.clientX - startX;
        const height = e.clientY - startY;
        selectionBox.style.width = `${Math.abs(width)}px`;
        selectionBox.style.height = `${Math.abs(height)}px`;
        if (width < 0) selectionBox.style.left = `${e.clientX}px`;
        if (height < 0) selectionBox.style.top = `${e.clientY}px`;
    };

    overlay.onmouseup = (e) => {
        isDrawing = false;
        document.body.removeChild(overlay);
        const rect = selectionBox.getBoundingClientRect();

        if (rect.width > 10 && rect.height > 10) {
            showPopup(rect, false, true); // isImage = true
            mainPopup.innerHTML = `<div class="ela-loading">Đang nhận diện ảnh...</div>`;

            chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, (response) => {
                if (response && response.imageData) {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const dpr = window.devicePixelRatio || 1;
                        canvas.width = rect.width * dpr;
                        canvas.height = rect.height * dpr;
                        ctx.drawImage(img, rect.left * dpr, rect.top * dpr, rect.width * dpr, rect.height * dpr, 0, 0, canvas.width, canvas.height);
                        const croppedImageData = canvas.toDataURL('image/png');
                        
                        chrome.runtime.sendMessage({ action: 'translateImage', imageData: croppedImageData }, (imgResponse) => {
                            if (imgResponse && imgResponse.success) {
                                renderImageTranslationResult(imgResponse.text);
                            } else {
                                renderError(imgResponse.error || "Lỗi dịch ảnh.");
                            }
                        });
                    };
                    img.src = response.imageData;
                } else {
                    renderError("Không thể chụp ảnh màn hình.");
                }
            });
        }
    };
}


// --- UI & POPUP LOGIC ---
function createTriggerIcon() {
    triggerIcon = document.createElement("div");
    triggerIcon.id = "ela-trigger-icon";
    triggerIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="white"/></svg>`;
    document.body.appendChild(triggerIcon);
    triggerIcon.addEventListener("mousedown", (e) => e.preventDefault());
    triggerIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        const selection = window.getSelection();
        if (selection.rangeCount > 0) showPopup(selection.getRangeAt(0).getBoundingClientRect());
    });
}

function positionTriggerIcon(range) {
    const rect = range.getBoundingClientRect();
    const iconSize = 28;
    const top = window.scrollY + rect.bottom + 8;
    const left = window.scrollX + rect.left + rect.width / 2 - iconSize / 2;
    triggerIcon.style.top = `${top}px`;
    triggerIcon.style.left = `${left}px`;
    triggerIcon.classList.add('visible');
}

function hideTriggerIcon() { if (triggerIcon) triggerIcon.classList.remove('visible'); }
function hidePopup() { if (mainPopup) mainPopup.style.display = 'none'; }

function showPopup(rect, center = false, isImage = false) {
    hideTriggerIcon();
    if (!mainPopup) {
        mainPopup = document.createElement("div");
        mainPopup.id = "ela-main-popup";
        document.body.appendChild(mainPopup);
    }
    
    if (!isImage) {
        mainPopup.innerHTML = `<div class="ela-loading">Đang tra cứu...</div>`;
    }
    mainPopup.style.display = 'block';

    if (center) {
        mainPopup.style.top = '50%';
        mainPopup.style.left = '50%';
        mainPopup.style.transform = 'translate(-50%, -50%)';
    } else {
        positionPopup(rect);
    }

    if (!isImage) {
        chrome.runtime.sendMessage({ action: 'smartLookup', text: selectedText }, (response) => {
            if (chrome.runtime.lastError) {
                renderError(`Lỗi: ${chrome.runtime.lastError.message}`);
                return;
            }
            if (response && response.success) renderResult(response);
            else renderError(response?.error || 'Đã có lỗi xảy ra.');
            if (!center) positionPopup(rect);
        });
    }
}

function positionPopup(rect) {
    const popupWidth = 360;
    mainPopup.style.visibility = "hidden";
    let popupHeight = mainPopup.offsetHeight;
    if (!popupHeight || popupHeight < 50) popupHeight = 150;
    let top = window.scrollY + rect.bottom + 10;
    let left = window.scrollX + rect.left + rect.width / 2 - popupWidth / 2;
    if (left < 10) left = 10;
    if (left + popupWidth > window.innerWidth - 10) left = window.innerWidth - popupWidth - 10;
    if (top + popupHeight > window.scrollY + window.innerHeight - 10) {
        top = window.scrollY + rect.top - popupHeight - 10;
    }
    mainPopup.style.top = `${top}px`;
    mainPopup.style.left = `${left}px`;
    mainPopup.style.transform = 'none';
    mainPopup.style.visibility = "visible";
}

// --- RENDERING & ACTIONS ---
function showToast(message) {
    if (!mainPopup) return;
    const existingToast = mainPopup.querySelector('.ela-toast');
    if (existingToast) existingToast.remove();
    const toast = document.createElement('div');
    toast.className = 'ela-toast';
    toast.textContent = message;
    mainPopup.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}

function renderError(message) {
    if (mainPopup) mainPopup.innerHTML = `<div class="ela-error">${message}</div>`;
}

function renderImageTranslationResult(translatedText) {
    const speakButtonHTML = `<button class="ela-icon-btn" data-action="speak" data-text="${translatedText}" title="Phát âm">🔊</button>`;
    mainPopup.innerHTML = `
        <div class="ela-header">
            <div class="ela-header-main">Dịch từ ảnh</div>
            <div class="ela-header-actions">${speakButtonHTML}</div>
        </div>
        <div class="ela-body"><div class="ela-translation">${translatedText}</div></div>`;
    
    mainPopup.querySelector('[data-action="speak"]').addEventListener('click', e => {
        e.stopPropagation();
        chrome.runtime.sendMessage({ action: 'speak', text: e.currentTarget.dataset.text });
    });
}

function renderResult(response) {
    const { type, data, isSaved, translation } = response;
    let headerHTML = '', bodyHTML = '';
    const wordToSave = (type === 'definition') ? data.word : selectedText;
    const textToSpeak = (type === 'definition') ? data.word : selectedText;

    const starUnsavedSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    const starSavedSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    const aiButtonSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"></path></svg>`;

    const saveButtonHTML = `<button class="ela-icon-btn save-btn ${isSaved ? 'saved' : ''}" data-action="save" title="Lưu từ">${isSaved ? starSavedSVG : starUnsavedSVG}</button>`;
    const speakButtonHTML = `<button class="ela-icon-btn" data-action="speak" title="Phát âm">🔊</button>`;
    const aiButtonHTML = `<button class="ela-icon-btn" data-action="ai" title="Phân tích AI">${aiButtonSVG}</button>`;

    if (type === 'definition') {
        const phonetic = data.phonetics?.find(p => p.text)?.text || '';
        headerHTML = `${speakButtonHTML}<div class="ela-header-main">${data.word}<span class="ela-phonetic">${phonetic}</span></div>`;
        bodyHTML = `<div class="ela-body">`;
        if (translation) bodyHTML += `<div class="ela-quick-translation">${translation}</div>`;
        data.meanings.forEach(m => {
            bodyHTML += `<div class="ela-pos">${m.partOfSpeech}</div><ol class="ela-def-list">`;
            m.definitions.slice(0, 3).forEach(d => { bodyHTML += `<li><p>${d.definition}</p></li>`; });
            bodyHTML += `</ol>`;
        });
        bodyHTML += `</div>`;
    } else if (type === 'translation') {
        headerHTML = `${speakButtonHTML}<div class="ela-header-main">${selectedText}</div>`;
        bodyHTML = `<div class="ela-body"><div class="ela-translation">${data.translatedText}</div></div>`;
    }

    mainPopup.innerHTML = `
        <div class="ela-header">
            ${headerHTML}
            <div class="ela-header-actions">
                ${aiButtonHTML}
                ${saveButtonHTML}
                <button class="ela-icon-btn" data-action="settings" title="Cài đặt">⚙️</button>
            </div>
        </div>
        ${bodyHTML}`;

    // --- Attach events to new buttons ---
    mainPopup.querySelector('[data-action="speak"]').addEventListener('click', e => {
        e.stopPropagation();
        chrome.runtime.sendMessage({ action: 'speak', text: textToSpeak });
    });
    mainPopup.querySelector('[data-action="settings"]').addEventListener('click', e => {
        e.stopPropagation();
        chrome.runtime.sendMessage({ action: 'openOptionsPage' });
    });
    const saveBtn = mainPopup.querySelector('[data-action="save"]');
    saveBtn.addEventListener('click', e => {
        e.stopPropagation();
        const isCurrentlySaved = saveBtn.classList.contains('saved');
        showToast(isCurrentlySaved ? "Đã xóa từ" : "Đã lưu từ");
        saveBtn.classList.toggle('saved');
        saveBtn.innerHTML = saveBtn.classList.contains('saved') ? starSavedSVG : starUnsavedSVG;
        chrome.runtime.sendMessage({ action: 'toggleSaveWord', word: wordToSave });
    });
    mainPopup.querySelector('[data-action="ai"]').addEventListener('click', e => {
        e.stopPropagation();
        const body = mainPopup.querySelector('.ela-body');
        body.innerHTML = `<div class="ela-loading">AI đang phân tích...</div>`;
        chrome.runtime.sendMessage({ action: 'aiAnalyze', text: wordToSave }, response => {
            if (response && response.success) {
                renderAiAnalysis(response.data, body);
            } else {
                body.innerHTML = `<div class="ela-error">${response?.error || 'Lỗi phân tích.'}</div>`;
            }
        });
    });
}

function renderAiAnalysis(data, container) {
    let html = '';
    if (data.explanation) {
        html += `<div class="ela-ai-section"><h4>Giải thích</h4><p>${data.explanation}</p></div>`;
    }
    if (data.synonyms && data.synonyms.length > 0) {
        html += `<div class="ela-ai-section"><h4>Từ đồng nghĩa</h4><div class="ela-tag-list">${data.synonyms.map(s => `<span class="ela-tag">${s}</span>`).join('')}</div></div>`;
    }
    if (data.antonyms && data.antonyms.length > 0) {
        html += `<div class="ela-ai-section"><h4>Từ trái nghĩa</h4><div class="ela-tag-list">${data.antonyms.map(a => `<span class="ela-tag">${a}</span>`).join('')}</div></div>`;
    }
    if (data.examples && data.examples.length > 0) {
        html += `<div class="ela-ai-section"><h4>Ví dụ</h4><ul class="ela-example-list">`;
        data.examples.forEach(ex => {
            html += `<li><p class="ex-en">${ex.en}</p><p class="ex-vi">${ex.vi}</p></li>`;
        });
        html += `</ul></div>`;
    }
    container.innerHTML = html;
}
