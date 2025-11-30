# Certificate Verifier Extension

A modern Chrome extension for verifying certificates using AI-powered OCR and domain validation. Works exclusively with trusted certification platforms.

## Features

- **AI-Powered Verification**: Uses OCR and LLM to extract and verify certificate data
- **Domain Whitelisting**: Only works on trusted platforms (Coursera, IBM, DeepLearning.ai, etc.)
- **Beautiful UI**: Modern design inspired by shadcn/ui components
- **Secure Communication**: API endpoints hidden in background script
- **Real-time Validation**: Instant verification with visual feedback
- **Auto-Save**: Automatically saves verified certificates to database

## Supported Platforms

The extension works only on these whitelisted domains:

- **Learning Platforms**: Coursera, Udacity, edX, Udemy, LinkedIn Learning
- **Tech Companies**: IBM, Google, Microsoft, AWS
- **AI/ML Platforms**: DeepLearning.AI, Kaggle
- **Other**: Code Alpha, Internshala, NPTEL, Skillshare

## Installation

### 1. Install the Backend First

The extension requires the backend server to be running. See [certificate-verification-backend](../certificate-verification-backend/README.md) for setup instructions.

### 2. Load the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `image-verifier-extension` folder

### 3. Configure API Endpoint

1. Click the extension icon
2. Open **Settings** (at the bottom)
3. Enter your backend URL: `http://localhost:3000/api/verify-certificate`
4. Click **Save**

## Usage

### Step 1: Visit a Whitelisted Domain

Navigate to one of the supported certification platforms (e.g., coursera.org, ibm.com).

### Step 2: Open the Extension

Click the extension icon in your browser toolbar.

- **Green icon**: Domain is whitelisted ✓
- **Warning message**: Domain not whitelisted

### Step 3: Select Certificate

The extension will automatically scan the page for images. Click on a certificate image to select it.

### Step 4: Verify

Click the **Verify Certificate** button. The extension will:

1. Extract text using OCR
2. Analyze data with AI (Groq Llama 3.1)
3. Validate domain matches company name
4. Display verification results
5. Auto-save to database if verified

### Step 5: View Results

The extension will show:

- **Verification Status**: Verified or Failed
- **Extracted Data**: Name, Company, Course, etc.
- **Validation Details**: Domain match, whitelist status, confidence score

## How It Works

```
1. User selects certificate image
   ↓
2. Extension checks if domain is whitelisted
   ↓
3. Image sent to backend via background script
   ↓
4. Backend performs OCR (Tesseract.js)
   ↓
5. OCR text sent to Groq LLM (Llama 3.1 8B)
   ↓
6. LLM extracts structured data (JSON)
   ↓
7. Backend validates company-domain match
   ↓
8. Results returned to extension
   ↓
9. Extension displays results + auto-saves
```

## Security Features

### 1. Domain Whitelisting

- Extension only works on pre-approved domains
- Prevents use on tampered or fake websites
- Domain validation in both extension and backend

### 2. Hidden API Endpoints

- API URLs stored in background script
- Not visible in popup HTML or JavaScript
- Secure communication via Chrome messaging API

### 3. Content Security Policy

- Prevents code injection
- Restricts script execution
- Protects against XSS attacks

### 4. Image Validation

- Only allows certificate-like images
- Minimum size requirements
- File type validation

## File Structure

```
image-verifier-extension/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker (API calls)
├── popup-new.html         # Main popup UI
├── popup-new.js           # Main popup logic
├── popup.css              # Modern shadcn-inspired styles
├── styles/
│   └── tokens.css         # Design system tokens
├── icons/
│   └── icon48.jpg         # Extension icon
├── popup.html             # (Old version - kept for reference)
├── popup.js               # (Old version - kept for reference)
└── README.md
```

## Design System

The extension uses a modern design system inspired by shadcn/ui:

- **Colors**: HSL-based color palette
- **Typography**: System fonts with careful sizing
- **Spacing**: Consistent spacing scale
- **Shadows**: Layered shadow system
- **Animations**: Smooth transitions and micro-interactions

## Configuration

### API Endpoint

Default: `http://localhost:3000/api/verify-certificate`

You can change this in the extension settings.

### Whitelisted Domains

To add more domains, edit `background.js`:

```javascript
const WHITELISTED_DOMAINS = [
  'coursera.org',
  'your-new-domain.com', // Add here
  // ...
];
```

Also update `manifest.json` host_permissions:

```json
"host_permissions": [
  "https://*.your-new-domain.com/*"
]
```

## Development

### Making Changes

1. Edit the files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

### Debugging

- Right-click the extension icon → **Inspect popup** (for popup console)
- Go to `chrome://extensions/` → **Inspect views: background page** (for background script console)

## Troubleshooting

### Extension doesn't work on a site

- Check if the domain is whitelisted
- Verify domain is added to `manifest.json` host_permissions
- Check browser console for errors

### Verification fails

- Ensure backend server is running
- Check API endpoint is correct in settings
- Verify MongoDB is connected
- Check Groq API key is valid

### No images found

- Page may not have certificate images
- Images may be too small (min 200x150)
- Try refreshing the extension

### CORS errors

- Ensure backend CORS is configured for extension
- Check `ALLOWED_ORIGINS` in backend `.env`
- Add extension ID to allowed origins

## Version History

- **v2.0** (Current)
  - Complete redesign with shadcn/ui inspired design
  - AI-powered verification with Groq LLM
  - Domain whitelisting
  - Background script for secure API calls
  - Auto-save to database
  - Modern progress indicators

- **v1.0**
  - Basic image verification
  - Simple UI
  - Manual endpoint configuration

## Privacy

- The extension only works on whitelisted domains
- No data is collected without user action
- Verification data is only sent when you click "Verify"
- Image data is processed server-side and not stored by extension
- All communication uses HTTPS (in production)

## License

MIT

## Support

For issues or questions:
1. Check the [backend README](../certificate-verification-backend/README.md)
2. Verify backend is running
3. Check browser console for errors
4. Open an issue on GitHub

## Credits

- Design inspired by [shadcn/ui](https://ui.shadcn.com/)
- OCR powered by [Tesseract.js](https://tesseract.projectnaptha.com/)
- LLM powered by [Groq](https://groq.com/)
