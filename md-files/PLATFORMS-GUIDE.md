# Platform Whitelist System Guide

## Overview

The CredVerify extension now uses a **dynamic platform whitelist** system that loads trusted domains from `platforms.json` instead of hardcoding them in the manifest. This allows you to easily manage 200+ platforms without cluttering the manifest file.

## How It Works

1. **Extension loads** → `background.js` fetches `platforms.json`
2. **User visits a site** → Extension checks if domain matches any in the whitelist
3. **Domain matched** → Extension shows platform info and enables verification
4. **Domain not matched** → Extension shows warning and disables features

## File Structure

```
extension/
├── platforms.json         ← Whitelist database (37 platforms, 51 domains)
├── js/
│   └── background.js      ← Loads platforms.json and checks domains
├── html/
│   └── popup.html
└── manifest.json          ← Minimal permissions, uses https://*/* wildcard
```

## Current Statistics

- **Platforms**: 37
- **Total Domains**: 51
- **Categories**: 
  - MOOC platforms (Coursera, Udemy, edX, etc.)
  - Government platforms (NPTEL, SWAYAM, Skill India)
  - Cloud vendors (AWS, Google Cloud, Microsoft)
  - Coding platforms (LeetCode, HackerRank, CodeChef)
  - Badge wallets (Credly, Badgr, Accredible)
  - Developer profiles (GitHub, GitLab)

## Adding New Platforms

### 1. Edit `platforms.json`

Add a new platform object to the `platforms` array:

```json
{
  "id": "your_platform_id",
  "name": "Your Platform Name",
  "category": "mooc",
  "domains": [
    "example.com",
    "www.example.com",
    "subdomain.example.com"
  ]
}
```

### 2. Platform Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier (lowercase, underscore-separated) |
| `name` | string | ✅ | Display name of the platform |
| `category` | string | ✅ | Platform category (see categories below) |
| `domains` | array | ✅ | List of allowed domains (without protocol) |

### 3. Supported Categories

- `mooc` - Massive Open Online Course platforms
- `indian_government` - Indian government learning platforms
- `cloud_vendor` - Cloud provider training (AWS, Google, Azure)
- `vendor_certification` - Vendor-specific certifications (Oracle, Cisco, IBM)
- `coding_platform` - Competitive coding sites
- `badge_wallet` - Digital badge and credential wallets
- `wallet_storage` - Credential storage platforms
- `ncvet_ecosystem` - NCVET-related platforms
- `developer_profile` - Developer portfolio sites

## Example: Adding a New Platform

Let's add Khan Academy:

```json
{
  "id": "khan_academy",
  "name": "Khan Academy",
  "category": "mooc",
  "domains": [
    "khanacademy.org",
    "www.khanacademy.org"
  ]
}
```

Add this object to the `platforms` array in `platforms.json`, then reload the extension.

## Domain Matching Logic

The extension checks if the current page domain matches ANY of these patterns:

```javascript
// For domain "coursera.org" in platforms.json:
✅ coursera.org
✅ www.coursera.org
✅ learner.coursera.org
✅ any.subdomain.coursera.org
❌ coursera.com (different TLD)
❌ fake-coursera.org (different domain)
```

## Testing Your Changes

### 1. After editing `platforms.json`:

```bash
# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('extension/platforms.json', 'utf8'))"
```

### 2. Reload the extension:

1. Go to `chrome://extensions/` (or `brave://extensions/`)
2. Find "CredVerify Certificate Extractor"
3. Click the reload icon 🔄

### 3. Check the console:

1. Right-click extension icon → **Inspect popup**
2. Check console logs for:
   ```
   ✅ Loaded 37 platforms with 51 domains
   📋 Sample domains: [...]
   ```

### 4. Visit a whitelisted site:

- Should see: `✓ Verified domain: example.com [Platform Badge]`
- Console should show: `📍 Platform: Platform Name (category)`

### 5. Visit a non-whitelisted site:

- Should see: `⚠️ Domain not whitelisted`

## Manifest Permissions

The extension now uses a **wildcard pattern** for `host_permissions`:

```json
"host_permissions": [
  "http://localhost/*",
  "https://credverify.vercel.app/*",
  "https://*/*"
]
```

This allows the extension to:
- Access any HTTPS site (for image fetching)
- But only **enable features** on whitelisted domains from `platforms.json`

## Benefits of This Approach

✅ **Scalable**: Add 1000+ platforms without bloating manifest  
✅ **Maintainable**: Single JSON file to manage all platforms  
✅ **Flexible**: Update whitelist without changing code  
✅ **Organized**: Platform metadata (name, category) in one place  
✅ **Fast**: All domains loaded once on extension startup  
✅ **Safe**: Whitelist checked before enabling any features  

## API for Popup Script

The popup can request platform data via messages:

```javascript
// Check current domain
const response = await chrome.runtime.sendMessage({ 
  action: 'checkDomain' 
});
// Returns: { isWhitelisted, domain, platform: { name, category, id } }

// Get full platforms list
const response = await chrome.runtime.sendMessage({ 
  action: 'getPlatforms' 
});
// Returns: { success, platforms: [...], totalDomains }
```

## Troubleshooting

### Extension doesn't load platforms.json

**Check**: Is `platforms.json` in the `extension/` root folder?
**Fix**: Move it from backend folder to extension folder

### "platforms.json" not found error

**Check**: Is it listed in `web_accessible_resources` in manifest.json?
**Fix**: 
```json
"web_accessible_resources": [
  {
    "resources": ["platforms.json"],
    "matches": ["<all_urls>"]
  }
]
```

### Domain not recognized even though in platforms.json

**Check**: Console logs when visiting the site
**Debug**: 
```javascript
// In background.js console
console.log(WHITELISTED_DOMAINS); // Should include your domain
```

### JSON syntax error

**Fix**: Validate JSON at https://jsonlint.com/ or:
```bash
node -e "JSON.parse(require('fs').readFileSync('extension/platforms.json'))"
```

## Future Enhancements

- [ ] Auto-sync platforms.json from backend/cloud
- [ ] Admin panel to manage platforms
- [ ] Platform-specific extraction rules
- [ ] Trust score per platform
- [ ] Community-contributed platform database

## Contributing

To add platforms:
1. Fork the repo
2. Add platform to `extension/platforms.json`
3. Test locally
4. Submit PR with platform details

---

**Last Updated**: December 2, 2025  
**Platforms**: 37  
**Domains**: 51
