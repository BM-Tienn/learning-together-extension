document.addEventListener('DOMContentLoaded', () => {
    loadSavedWords();
    loadLookupHistory();
    setupTabs();
    document.getElementById('clear-history-btn').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'clearLookupHistory' }, () => {
            document.getElementById('history-list').innerHTML = `<p class="empty-state">Lịch sử tra cứu đã được xóa.</p>`;
        });
    });
});

function setupTabs() {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tab = link.dataset.tab;
            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            tabContents.forEach(content => {
                content.classList.toggle('active', content.id === tab);
            });
        });
    });
}

function renderList(containerId, items, type) {
    const listContainer = document.getElementById(containerId);
    const emptyMessage = type === 'saved' ? 'Bạn chưa lưu từ nào.' : 'Lịch sử tra cứu trống.';
    if (!items || items.length === 0) {
        listContainer.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
        return;
    }
    listContainer.innerHTML = ''; // Clear
    items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'word-item';
        itemEl.dataset.word = item;
        itemEl.innerHTML = `
            <span class="word-text">${item}</span>
            <div class="word-actions">
                <button class="action-btn speak-btn" title="Phát âm">🔊</button>
                ${type === 'saved' ? '<button class="action-btn delete-btn" title="Xóa">🗑️</button>' : ''}
            </div>
        `;
        listContainer.appendChild(itemEl);
    });
    addWordItemListeners(containerId, type);
}

function loadSavedWords() {
    chrome.runtime.sendMessage({ action: 'getSavedWords' }, (words) => {
        if (!chrome.runtime.lastError) renderList('saved-words-list', words, 'saved');
    });
}

function loadLookupHistory() {
    chrome.runtime.sendMessage({ action: 'getLookupHistory' }, (history) => {
        if (!chrome.runtime.lastError) renderList('history-list', history, 'history');
    });
}

function addWordItemListeners(containerId, type) {
    const container = document.getElementById(containerId);
    container.querySelectorAll('.speak-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const word = e.target.closest('.word-item').dataset.word;
            chrome.runtime.sendMessage({ action: 'speak', text: word });
        });
    });
    if (type === 'saved') {
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const wordItem = e.target.closest('.word-item');
                const word = wordItem.dataset.word;
                wordItem.remove();
                chrome.runtime.sendMessage({ action: 'deleteSavedWord', word: word }, () => {
                    if (container.children.length === 0) {
                        container.innerHTML = `<p class="empty-state">Bạn chưa lưu từ nào.</p>`;
                    }
                });
            });
        });
    }
}