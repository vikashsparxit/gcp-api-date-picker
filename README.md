# GCP APIs: Custom Date & Request Total

A Chrome extension for the Google Cloud **APIs & Services** dashboard that lets you choose a **custom date range** (and console presets) and see the **total of all API requests** for that period—without leaving the page.

## Features

- **Custom date range** – Pick any start/end date and apply it to the GCP APIs dashboard in one click (the main feature not available in the console by default).
- **Console presets** – Same ranges as the console: 1h, 6h, 12h, 1d, 2d, 4d, 7d, 14d, 30d, plus **Custom** (highlighted in the UI).
- **Total requests** – Reads the Requests column from the dashboard table, sums all APIs, and shows:
  - **In the popup** – “Total requests (this period)” with a Refresh button.
  - **On the page** – A blue badge in the top-right with the same total.
- **Heartbeat** – While the popup is open on the dashboard, the extension polls every 5 seconds and stops when the total is stable (last 3 fetches match). A **green pulsing dot** means “updating”; a **red dot** means “idle”.
- **Account & project preserved** – Applying a date range keeps your current `authuser` and `project` in the URL.
- **Sync with console** – If you change the range in the console (e.g. 14 days), the extension reflects it when you open the popup.
- **Overlay off-dashboard** – When you open the extension on a non-GCP URL, an overlay explains that you need to be on the APIs dashboard and provides a link to open it.

## Quick start

### From Chrome Web Store

1. Open the [Chrome Web Store](https://chrome.google.com/webstore) and search for **GCP APIs** or **Custom Date Request Total**.
2. Click **Add to Chrome** and confirm permissions.

### Manual installation (developers)

1. **Clone the repo**
   ```bash
   git clone https://github.com/vikashsparxit/gcp-api-date-picker.git
   cd gcp-api-date-picker
   ```

2. **Load in Chrome**
   - Go to `chrome://extensions/`
   - Turn on **Developer mode** (top right)
   - Click **Load unpacked** and select the extension folder

3. **Use it**
   - Open [Google Cloud Console → APIs & Services](https://console.cloud.google.com/apis/dashboard)
   - Click the extension icon
   - Choose a preset (e.g. 30d) or **Custom** and set start/end dates
   - Click **Apply Date Range**
   - See **Total requests (this period)** in the popup and on the page (blue badge)

## Project structure

```
gcp-api-date-picker/
├── manifest.json         # Extension config (MV3), permissions, content scripts
├── popup.html            # Popup UI (presets, date inputs, total requests, overlay)
├── popup.js              # Popup logic, URL building, heartbeat, storage
├── content.js            # Injects “Custom Date Range” button + total-requests badge on dashboard
├── getTotalRequests.js   # Sums Requests column from visible tables/grids on the page
├── style.css             # Styles for injected dashboard UI
├── icons/                # Extension icons (16, 48, 128)
├── README.md
└── LICENSE               # MIT
```

## How it works

- **Date range** – The GCP console encodes the range in the `pageState` query parameter (e.g. `groupValue` for presets like `P30D`, or `customValue` with `start`/`end`). The extension builds this URL, keeps `authuser` and `project`, and navigates the tab so the dashboard reloads with the new range.
- **Total requests** – A content script runs on the APIs dashboard, finds tables/grids with a “Requests” column, sums the values (preferring the table with the most data rows), and optionally uses a higher “Total requests: N” from the page when present. The result is shown in the on-page badge and sent to the popup on request; the popup also runs a heartbeat (poll every 5s, stop when stable) and shows a green/red status dot.

## Permissions

- **`storage`** – Store last-used dates and preferences.
- **`tabs`** – Detect the active tab and update its URL when applying a date range.
- **`host_permissions`: `https://console.cloud.google.com/*`** – Run only on the Cloud Console.

No external servers; everything runs in your browser.

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| Extension doesn’t do anything | Make sure the current tab is `console.cloud.google.com/apis/dashboard`. |
| Total requests wrong or stale | Click **Refresh** in the popup, or wait for the heartbeat (green dot) to settle. |
| Wrong account/project after Apply | This build keeps `authuser` and `project` from the current URL; if it still switches, open the dashboard in the correct account first, then use the extension. |
| No blue badge on page | Reload the APIs dashboard and open the extension again; the badge is injected by the content script. |

## Contributing

1. Fork the repo.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Commit: `git commit -am 'Add feature'`.
4. Push: `git push origin feature/your-feature`.
5. Open a Pull Request.

Ideas: more date presets, dark theme, i18n, or improving total-requests detection for future console UI changes.

## License

MIT – see [LICENSE](LICENSE).

## Author

**Vikash Sparxit**  
GitHub: [@vikashsparxit](https://github.com/vikashsparxit)

For bugs or feature requests, open an issue on [GitHub Issues](https://github.com/vikashsparxit/gcp-api-date-picker/issues).
