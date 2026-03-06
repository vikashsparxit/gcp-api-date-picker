# 📅 GCP API Date Picker Extension

A Chrome extension that adds a visual date picker to Google Cloud Console's APIs Dashboard, eliminating the need for manual URL parameter manipulation.

## 🎯 Features

✅ **Visual Date Picker** - Easy-to-use date range selector with native HTML5 date inputs  
✅ **One-Click Filtering** - Apply custom date ranges instantly  
✅ **Persistent Storage** - Saves your last used dates for quick access  
✅ **All GCP Projects** - Works across all Google Cloud projects  
✅ **Zero Dependencies** - Lightweight, no external libraries  
✅ **Open Source** - MIT Licensed, contributions welcome  

## 🚀 Quick Start

### Installation from Chrome Web Store (Coming Soon)
```
1. Visit Chrome Web Store
2. Search for "GCP Date Picker"
3. Click "Add to Chrome"
4. Confirm permissions
```

### Manual Installation (For Developers)

1. **Clone/Download this repository**
   ```bash
   git clone https://github.com/vikashsparxit/gcp-api-date-picker.git
   cd gcp-api-date-picker
   ```

2. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable **Developer mode** (top right toggle)
   - Click **Load unpacked**
   - Select the extension folder

3. **Use the Extension**
   - Navigate to `console.cloud.google.com/apis/dashboard`
   - Click the extension icon in your toolbar
   - Select start and end dates
   - Click **Apply Date Range**

## 📁 Project Structure

```
gcp-api-date-picker/
├── manifest.json      # Extension configuration
├── popup.html         # Date picker UI
├── popup.js           # Date picker logic
├── content.js         # Content script for GCP dashboard
├── style.css          # Extension styling
├── README.md          # This file
└── LICENSE            # MIT License
```

## 🔧 File Descriptions

### manifest.json
Defines the extension metadata, permissions, and behavior:
- Target URLs: Google Cloud APIs Dashboard
- Permissions: Active tab and scripting
- Content scripts: Injected into GCP pages

### popup.html
User interface for date selection:
- Start date input field
- End date input field  
- Apply button
- Helpful information text

### popup.js
Handles the date picker logic:
- Validates date inputs
- Constructs the correct URL with date parameters
- Saves dates to Chrome storage
- Loads previously used dates

### content.js
Injected into the GCP dashboard:
- Adds visual button for quick access
- Currently minimal (can be extended for in-page UI)

### style.css
Styling for the extension UI:
- Google Cloud-inspired color scheme (#4285f4)
- Responsive button design
- Professional appearance

## 💡 How It Works

Google Cloud Console stores date ranges in URL parameters with this structure:

```
https://console.cloud.google.com/apis/dashboard?pageState=(%22duration%22:(%22groupValue%22:null,%22customValue%22:(%22start%22:%222026-01-21%22,%22end%22:%222026-02-20%22)))
```

This extension provides a user-friendly interface to generate these URLs without manual parameter construction.

### Date Format
Dates are formatted as **YYYY-MM-DD** (ISO 8601) strings, e.g.:
- `2026-01-21` for January 21, 2026
- `2026-02-20` for February 20, 2026

## 🔐 Privacy & Permissions

- **No data collection** - All dates are stored locally in your browser
- **No external servers** - Extension runs entirely in your browser
- **Minimal permissions** - Only accesses Google Cloud Console URLs
- **Open source** - Review the code anytime

## 🐛 Troubleshooting

### Extension doesn't appear
- Ensure you're on `console.cloud.google.com/apis/dashboard`
- Check that the extension is enabled in `chrome://extensions/`
- Try refreshing the page

### Dates not saving
- Check that Chrome storage is enabled
- Clear browser cache and reload
- Reinstall the extension

### URL not updating correctly
- Verify the date format (YYYY-MM-DD)
- Ensure both start and end dates are selected
- Check browser console for errors (F12)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -am 'Add feature'`)
4. Push to branch (`git push origin feature/improvement`)
5. Create Pull Request

### Ideas for Contributions
- Add preset date ranges (Last 7 days, Last 30 days, etc.)
- Support for custom date range patterns
- Export/import saved date ranges
- Dark mode support
- Internationalization (multiple languages)

## 📋 Publishing Roadmap

- [x] Create GitHub repository
- [x] Add comprehensive documentation
- [ ] Submit to Chrome Web Store
- [ ] Get initial reviews and feedback
- [ ] Publish publicly
- [ ] Create release tags on GitHub

## 📄 License

MIT License - See LICENSE file for details. You're free to use, modify, and distribute this extension.

## 👨‍💻 Author

**Vikash Sparxit**  
Senior Developer | AI Enthusiast | Open Source Contributor  
GitHub: [@vikashsparxit](https://github.com/vikashsparxit)

## 🙏 Support

If you find this extension helpful:
- ⭐ Star the repository
- 🐛 Report issues on GitHub
- 💬 Share feedback and suggestions
- 🔄 Contribute improvements

## 📞 Contact & Support

For issues, feature requests, or questions:
- Open an issue on [GitHub Issues](https://github.com/vikashsparxit/gcp-api-date-picker/issues)
- Check existing issues before creating new ones
- Provide clear descriptions and screenshots when reporting bugs

---

**Made with ❤️ for Google Cloud developers**
