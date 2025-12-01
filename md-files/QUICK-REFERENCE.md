# 🚀 Quick Reference - Dynamic Platform Whitelist

## ⚡ Quick Commands

```bash
# Show statistics
npm run platforms:stats

# List all platforms
npm run platforms:list

# Search for a platform
npm run platforms:search <domain>

# Add new platform
node scripts/platforms-manager.js add \
  <id> "<name>" <category> <domain1> [domain2] [domain3]...

# Example: Add Khan Academy
node scripts/platforms-manager.js add \
  khan_academy "Khan Academy" mooc \
  khanacademy.org www.khanacademy.org
```

---

## 📁 File Locations

```
extension/
├── platforms.json          ← Add/edit platforms here
├── js/background.js        ← Loads platforms on startup
├── manifest.json           ← Minimal permissions
└── PLATFORMS-GUIDE.md      ← Full documentation

scripts/
└── platforms-manager.js    ← CLI tool for managing platforms
```

---

## 🎯 Adding a Platform (3 Ways)

### 1️⃣ Direct Edit (Fastest)
Edit `extension/platforms.json`:
```json
{
  "id": "your_id",
  "name": "Platform Name",
  "category": "mooc",
  "domains": ["example.com"]
}
```

### 2️⃣ CLI Tool
```bash
node scripts/platforms-manager.js add \
  your_id "Platform Name" mooc example.com
```

### 3️⃣ NPM Script
```bash
npm run platforms:add -- \
  your_id "Platform Name" mooc example.com
```

---

## ✅ Testing Checklist

- [ ] 1. Reload extension: `chrome://extensions/` → 🔄
- [ ] 2. Check console: Right-click extension → "Inspect popup"
- [ ] 3. Should see: `✅ Loaded 37 platforms with 51 domains`
- [ ] 4. Visit whitelisted site → Should see platform badge
- [ ] 5. Visit non-whitelisted site → Should see warning

---

## 📊 Current Stats

- **Platforms**: 37
- **Domains**: 51
- **Categories**: 9

Top categories:
- MOOC: 10 platforms
- Indian Government: 6 platforms
- Coding Platforms: 5 platforms

---

## 🔍 Domain Matching

For domain `coursera.org` in platforms.json:
- ✅ `coursera.org`
- ✅ `www.coursera.org`
- ✅ `learner.coursera.org`
- ✅ `any.subdomain.coursera.org`
- ❌ `coursera.com` (different TLD)

---

## 🏷️ Categories

Use these when adding platforms:
- `mooc` - Online course platforms
- `indian_government` - Govt learning platforms
- `cloud_vendor` - AWS, Google Cloud, Azure
- `coding_platform` - LeetCode, HackerRank
- `badge_wallet` - Credly, Badgr
- `vendor_certification` - Oracle, Cisco, IBM
- `developer_profile` - GitHub, GitLab
- `ncvet_ecosystem` - NCVET platforms
- `wallet_storage` - DigiLocker

---

## 🐛 Troubleshooting

### Platform not recognized?
1. Check console logs
2. Verify domain in `platforms.json`
3. Reload extension
4. Check spelling (case-sensitive)

### JSON error?
```bash
node -e "JSON.parse(require('fs').readFileSync('extension/platforms.json'))"
```

### Extension not loading?
1. Check manifest syntax
2. Verify `platforms.json` exists
3. Check `web_accessible_resources`

---

## 📚 Documentation

- **Full Guide**: `extension/PLATFORMS-GUIDE.md`
- **Implementation**: `PLATFORM-WHITELIST-IMPLEMENTATION.md`

---

**Last Updated**: December 2, 2025
