# English Language Assistant - Chrome Extension

Một extension Chrome mạnh mẽ để hỗ trợ học tiếng Anh trên web với các tính năng dịch thông minh, phân tích AI, OCR và quản lý từ vựng.

## 🌟 Tính năng chính

### 🔍 Tra cứu thông minh
- **Tự động nhận diện**: Tự động phân biệt từ đơn và cụm từ
- **Cache thông minh**: Lưu cache kết quả tra cứu để tăng tốc độ
- **Context Menu**: Click chuột phải để tra cứu nhanh
- **Popup thông minh**: Hiển thị kết quả ngay khi chọn text

### 📖 Dịch thuật đa năng
- **Dịch từ điển**: Tra cứu định nghĩa chi tiết với phiên âm
- **Dịch văn bản**: Dịch cụm từ và câu dài
- **Dịch ảnh (OCR)**: Chọn vùng ảnh để dịch text trong ảnh
- **Dịch trang web**: Mở Google Translate cho toàn bộ trang

### 🤖 Phân tích AI (Gemini)
- **Phân tích ngữ nghĩa**: Giải thích chi tiết ý nghĩa từ
- **Từ đồng nghĩa**: Liệt kê các từ có nghĩa tương tự
- **Từ trái nghĩa**: Hiển thị các từ có nghĩa đối lập
- **Ví dụ sử dụng**: Cung cấp ví dụ Anh-Việt

### 🔊 Phát âm
- **Text-to-Speech**: Phát âm với giọng Anh-Mỹ tự nhiên
- **Tốc độ điều chỉnh**: Hỗ trợ điều chỉnh tốc độ đọc
- **Tích hợp sẵn**: Sử dụng Chrome TTS API

### 💾 Quản lý từ vựng
- **Lưu từ yêu thích**: Đánh dấu sao để lưu từ quan trọng
- **Lịch sử tra cứu**: Theo dõi 50 từ tra cứu gần nhất
- **Quản lý dữ liệu**: Xem, xóa và phát âm từ đã lưu

## 🚀 Cách sử dụng

### 1. Cài đặt extension
```bash
# Clone repository
git clone [repository-url]
cd english-language-assistant

# Mở Chrome và vào chrome://extensions/
# Bật "Developer mode"
# Click "Load unpacked" và chọn thư mục dự án
```

### 2. Cấu hình API (Tùy chọn)
- Mở extension popup → Click "Cài đặt & Dữ liệu"
- Tab "Cài đặt" → Nhập Gemini API Key
- Lấy API key tại: https://aistudio.google.com/app/apikey

### 3. Sử dụng trên web
- **Chọn text**: Bôi đen từ/cụm từ tiếng Anh
- **Click icon**: Icon ⭐ xuất hiện → click để tra cứu
- **Context menu**: Chuột phải → "Tra cứu thông minh"
- **Dịch ảnh**: Popup → "Dịch ảnh (Chọn vùng)"

## 🛠️ Cấu trúc dự án

```
english-language-assistant/
├── manifest.json              # Cấu hình extension
├── assets/
│   ├── css/
│   │   ├── style.css         # Styles cho popup chính
│   │   └── options.css       # Styles cho trang options
│   └── icons/
│       ├── icon16.png        # Icon 16x16
│       ├── icon48.png        # Icon 48x48
│       └── icon128.png       # Icon 128x128
├── src/
│   ├── background/
│   │   └── index.js          # Service worker - Logic chính
│   ├── content/
│   │   └── index.js          # Content script - UI popup
│   ├── popup/
│   │   ├── index.html        # Popup chính
│   │   └── index.js          # Logic popup
│   └── options/
│       ├── index.html        # Trang cài đặt
│       └── index.js          # Logic cài đặt
└── README.MD                 # Hướng dẫn này
```

## 🔧 Chi tiết kỹ thuật

### Background Script (`src/background/index.js`)
- **Cache Manager**: Quản lý cache với TTL 1 giờ
- **API Integration**: 
  - Dictionary.dev API (từ điển)
  - MyMemory API (dịch thuật)
  - Gemini API (phân tích AI)
- **Storage Management**: Quản lý từ đã lưu và lịch sử
- **TTS Integration**: Phát âm với Chrome TTS

### Content Script (`src/content/index.js`)
- **Text Selection**: Theo dõi và xử lý text được chọn
- **Popup UI**: Tạo và quản lý popup thông minh
- **OCR Selection**: Chọn vùng ảnh để dịch
- **Responsive Design**: Tự động điều chỉnh vị trí popup

### Popup (`src/popup/`)
- **Quick Actions**: Dịch ảnh, dịch trang, cài đặt
- **Minimal UI**: Giao diện đơn giản và nhanh

### Options (`src/options/`)
- **Tab Interface**: 3 tab chính (Từ đã lưu, Lịch sử, Cài đặt)
- **Data Management**: Xem, xóa, phát âm từ đã lưu
- **API Configuration**: Cài đặt Gemini API Key

## 🎨 Thiết kế UI/UX

### Popup Chính
- **Modern Design**: Thiết kế Material Design
- **Smart Positioning**: Tự động điều chỉnh vị trí
- **Loading States**: Hiển thị trạng thái đang tải
- **Error Handling**: Xử lý lỗi thân thiện

### Màu sắc
- **Primary**: `#4f46e5` (Indigo)
- **Background**: `#f8f9fa` (Light Gray)
- **Text**: `#1f2937` (Dark Gray)
- **Border**: `#e5e7eb` (Light Border)

## 🔌 APIs được sử dụng

### Miễn phí
- **Dictionary.dev**: `https://api.dictionaryapi.dev/`
- **MyMemory**: `https://api.mymemory.translated.net/`

### Cần API Key
- **Google Gemini**: `https://generativelanguage.googleapis.com/`
  - Phân tích AI
  - Dịch ảnh (OCR)

## 📊 Tính năng nâng cao

### Cache System
```javascript
// Cache với TTL 1 giờ, tối đa 100 items
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100;
    }
}
```

### Smart Text Detection
```javascript
// Tự động phân biệt từ đơn và cụm từ
const wordCount = text.trim().split(/\s+/).length;
const result = (wordCount === 1) ? 
    await getDefinition(text) : 
    await getTranslation(text);
```

### OCR Image Translation
```javascript
// Chụp màn hình và cắt vùng được chọn
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.drawImage(img, rect.left * dpr, rect.top * dpr, 
    rect.width * dpr, rect.height * dpr, 
    0, 0, canvas.width, canvas.height);
```

## 🚀 Performance

### Tối ưu hóa
- **Cache thông minh**: Giảm API calls
- **Lazy loading**: Chỉ tải khi cần
- **Debounced events**: Tránh spam API
- **Error recovery**: Tự động fallback

### Memory Management
- **Popup cleanup**: Tự động xóa DOM elements
- **Cache eviction**: LRU cache strategy
- **Storage limits**: Giới hạn lịch sử 50 items

## 🔒 Bảo mật

### Permissions
```json
{
    "permissions": [
        "tts",           // Text-to-Speech
        "storage",        // Local storage
        "activeTab",      // Access current tab
        "contextMenus",   // Right-click menu
        "scripting"       // Execute scripts
    ]
}
```

### Data Privacy
- **Local Storage**: Dữ liệu chỉ lưu local
- **No Tracking**: Không thu thập thông tin cá nhân
- **API Keys**: Chỉ lưu trong extension storage

## 🐛 Troubleshooting

### Lỗi thường gặp
1. **API Key không hoạt động**
   - Kiểm tra key tại https://aistudio.google.com/app/apikey
   - Đảm bảo có quota cho Gemini API

2. **Popup không hiển thị**
   - Refresh trang web
   - Kiểm tra console để xem lỗi

3. **Dịch ảnh không hoạt động**
   - Cần API Key hợp lệ
   - Ảnh phải có text rõ ràng

## 📝 Changelog

### Version 1.0.0
- ✨ Tra cứu thông minh với cache
- 🤖 Phân tích AI với Gemini
- 📷 Dịch ảnh (OCR)
- 💾 Quản lý từ vựng
- 🔊 Text-to-Speech
- 🎨 UI/UX hiện đại
- 📱 Responsive design

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

MIT License - Xem file `LICENSE` để biết thêm chi tiết.

## 🙏 Cảm ơn

- [Dictionary.dev](https://dictionaryapi.dev/) - API từ điển miễn phí
- [MyMemory](https://mymemory.translated.net/) - API dịch thuật
- [Google Gemini](https://aistudio.google.com/) - AI Analysis
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/) - Documentation

---

**Lưu ý**: Extension sử dụng API miễn phí có giới hạn. Vui lòng sử dụng có trách nhiệm.
  