# English Language Assistant - Chrome Extension

Một extension Chrome mạnh mẽ để hỗ trợ học tiếng Anh trên web với các tính năng dịch, phân tích ngữ nghĩa, phát âm và tra cứu từ điển.

## 🌟 Tính năng chính

### 📖 Dịch thuật
- Dịch từ tiếng Anh sang tiếng Việt
- Hỗ trợ dịch cả từ đơn và cụm từ
- Sử dụng API MyMemory miễn phí

### 📚 Từ điển
- Tra cứu định nghĩa từ tiếng Anh
- Hiển thị phiên âm (phonetics)
- Cung cấp các nghĩa khác nhau của từ
- Sử dụng API Dictionary.dev miễn phí

### 🔍 Phân tích ngữ nghĩa
- Phân tích loại từ (danh từ, động từ, tính từ...)
- Đánh giá độ phức tạp của từ
- Phân tích mức độ phổ biến
- Thông tin ngữ pháp cơ bản

### 🔊 Phát âm
- Hỗ trợ nhiều giọng đọc khác nhau:
  - 🇺🇸 Tiếng Anh (Mỹ) - en-US
  - 🇬🇧 Tiếng Anh (Anh) - en-GB
  - 🇦🇺 Tiếng Anh (Úc) - en-AU
  - 🇨🇦 Tiếng Anh (Canada) - en-CA
- Điều chỉnh tốc độ đọc (chậm, bình thường, nhanh)
- Sử dụng Chrome TTS API

## 🚀 Cách sử dụng

1. **Cài đặt extension**
   - Mở Chrome và vào `chrome://extensions/`
   - Bật "Developer mode"
   - Click "Load unpacked" và chọn thư mục chứa extension

2. **Sử dụng trên web**
   - Bôi đen bất kỳ từ hoặc cụm từ tiếng Anh nào trên trang web
   - Icon extension sẽ xuất hiện
   - Click vào icon để mở popup với các tùy chọn

3. **Các tab chức năng**
   - **Dịch**: Dịch từ tiếng Anh sang tiếng Việt
   - **Từ điển**: Tra cứu định nghĩa và phiên âm
   - **Phân tích**: Phân tích ngữ nghĩa và ngữ pháp
   - **Phát âm**: Nghe phát âm với nhiều giọng đọc

## 🛠️ Cài đặt và phát triển

### Yêu cầu hệ thống
- Google Chrome (phiên bản 88+)
- Kết nối internet để sử dụng các API

### Cấu trúc dự án
```
extension/
├── manifest.json          # Cấu hình extension
├── background.js          # Service worker
├── content.js            # Content script chính
├── style.css             # CSS styles
├── images/               # Icons và assets
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
└── README.MD            # Hướng dẫn này
```

### APIs được sử dụng
- **MyMemory Translation API**: Dịch thuật miễn phí
- **Dictionary.dev API**: Từ điển tiếng Anh
- **Chrome TTS API**: Phát âm văn bản

## 🎨 Thiết kế

### Giao diện
- Thiết kế hiện đại với gradient và blur effects
- Hỗ trợ dark mode tự động
- Responsive design cho mobile
- Animations mượt mà

### Màu sắc chủ đạo
- Primary: `#667eea` (Indigo)
- Secondary: `#764ba2` (Purple)
- Success: `#28a745` (Green)
- Warning: `#ffc107` (Yellow)
- Error: `#dc3545` (Red)

## 🔧 Tùy chỉnh

### Thêm API mới
Để thêm API dịch thuật hoặc từ điển mới:

1. Thêm host permission trong `manifest.json`:
```json
"host_permissions": [
    "https://your-api-domain.com/*"
]
```

2. Tạo function mới trong `content.js`:
```javascript
async function yourNewAPI(text) {
    const response = await fetch(`https://your-api-domain.com/translate?text=${text}`);
    return await response.json();
}
```

### Thay đổi giao diện
- Chỉnh sửa `style.css` để thay đổi màu sắc và layout
- Thêm CSS variables để dễ tùy chỉnh
- Hỗ trợ custom themes

## 📝 Changelog

### Version 2.0
- ✨ Thêm tính năng phân tích ngữ nghĩa
- 🎨 Thiết kế UI/UX hoàn toàn mới
- 🌙 Hỗ trợ dark mode
- 📱 Responsive design
- 🔧 Cải thiện performance

### Version 1.0
- 🚀 Tính năng dịch cơ bản
- 🔊 Phát âm với TTS
- 📚 Tra cứu từ điển

## 🤝 Đóng góp

Chúng tôi rất hoan nghênh mọi đóng góp! Để đóng góp:

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 🙏 Cảm ơn

- [MyMemory Translation API](https://mymemory.translated.net/) cho dịch vụ dịch thuật miễn phí
- [Dictionary.dev](https://dictionaryapi.dev/) cho API từ điển
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/) cho documentation

## 📞 Liên hệ

Nếu có bất kỳ câu hỏi hoặc đề xuất nào, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.

---

**Lưu ý**: Extension này sử dụng các API miễn phí và có thể có giới hạn về số lượng request. Vui lòng sử dụng có trách nhiệm.
  