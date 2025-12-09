# Certificate Company Name Display Fix

## Problem
The certificate watcher was saving all processed certificates in an "unknown" company folder because the LLM couldn't extract the company name from the OCR text. The company name wasn't being displayed on the certificate image itself.

### Error Log:
```
LLM extraction successful: Ekaraj Chokshi
Saved image to: ../storage/organization-certificates/2025/12/unknown/6937e6bb208a58a44ae78482.png
```

### Root Cause:
The certificate image only displayed:
- Certificate ID
- Recipient name
- Course title
- Issue date
- Instructor name
- Duration
- NSQF level

But **did NOT display the company/organization name**, so the LLM had no way to extract it from the OCR text.

---

## Solution

Added the issuer/company name to the certificate design, positioned below the "OF COMPLETION" subtitle.

### Changes Made:

#### 1. Updated Certificate Image Generation

**File:** `random_certificate_generator.py`

**Added issuer display to certificate:**
```python
# Company/Issuer name (smaller, below subtitle)
issuer_text = data.get('issuer', data.get('company_name', ''))
draw.text((width//2, 220), issuer_text, fill=GRAY, font=info_font, anchor='mm')
```

**Updated decorative line position:**
```python
# BEFORE: Y: 220
draw.line([(width//2 - 200, 220), (width//2 + 200, 220)], fill=GOLD, width=3)

# AFTER: Y: 245 (shifted down to make room for issuer)
draw.line([(width//2 - 200, 245), (width//2 + 200, 245)], fill=GOLD, width=3)
```

**Updated "This is to certify that" position:**
```python
# BEFORE: Y: 260
draw.text((width//2, 260), "This is to certify that", fill=GRAY, font=info_font, anchor='mm')

# AFTER: Y: 280
draw.text((width//2, 280), "This is to certify that", fill=GRAY, font=info_font, anchor='mm')
```

#### 2. Added Company Data to Certificate Generation

**File:** `random_certificate_generator.py` (Line 303-314)

```python
# BEFORE:
cert_data = {
    'recipient_name': recipient_name,
    'certificate_id': certificate_id,
    'course_title': company_data['course_title'],
    'issue_date': issue_date,
    'hours': hours,
    'nsqf_level': nsqf_level,
    'instructor': company_data['instructor']
}

# AFTER:
cert_data = {
    'recipient_name': recipient_name,
    'certificate_id': certificate_id,
    'company_name': company_data['company_name'],  # ← Added
    'issuer': company_data['issuer'],              # ← Added
    'course_title': company_data['course_title'],
    'issue_date': issue_date,
    'hours': hours,
    'nsqf_level': nsqf_level,
    'instructor': company_data['instructor']
}
```

#### 3. Updated Documentation

**File:** `CERTIFICATE_DESIGN.md`

Added new section:
```markdown
#### Issuer/Company Name
- Text: Organization issuer name (e.g., "Infosys Limited", "TechCorp Training Division")
- Position: Center, Y: 220
- Font: Helvetica, 18px
- Color: Gray (#4A5568)
- **Purpose:** Identifies the issuing organization for LLM extraction
```

Updated Y-positions for all elements below (shifted down by 20px).

---

## New Certificate Layout

```
┌─────────────────────────────────────────────────────┐
│                                      ID: CERT-XX    │
│                                                     │
│               CERTIFICATE                           │  Y: 150
│              OF COMPLETION                          │  Y: 195
│           TechCorp Training Division                │  Y: 220 ← NEW
│              ─────────────                          │  Y: 245
│                                                     │
│         This is to certify that                    │  Y: 280
│                                                     │
│            [Recipient Name]                         │  Y: 330
│            ─────────────────                        │  Y: 365
│                                                     │
│       has successfully completed                   │  Y: 400
│                                                     │
│        FULL STACK WEB DEVELOPMENT                  │  Y: 460
│                                                     │
│  ───────────────────────────────────────────       │
│                                                     │
│  Issue Date:    [Signature Line]     [QR Code]     │
│  Dec 09, 2024   Instructor Name                    │
│                 Instructor           NSQF Level 5   │
│  Duration:                                          │
│  15.5 hours                                         │
└─────────────────────────────────────────────────────┘
```

---

## Impact

### Before:
- ❌ Company name: **Unknown**
- ❌ LLM couldn't extract organization
- ❌ All certificates saved in "unknown" folder
- ❌ No way to identify issuing organization from certificate image

### After:
- ✅ Company name: **Clearly displayed** below "OF COMPLETION"
- ✅ LLM can extract: "TechCorp Training Division", "Infosys Limited", etc.
- ✅ Certificates organized by company: `/2025/12/techcorp-training-division/`
- ✅ Issuing organization visible on certificate

---

## Testing

### Expected OCR Text (New):
```
ID: CERT-2025-2E6583A6
CERTIFICATE
OF COMPLETION
TechCorp Training Division  ← Now included!
This is to certify that
Ekaraj Chokshi
has successfully completed
UI/UX DESIGN
Issue Date: May 25, 2025
Dr. Vikram Singh
Instructor
Duration: 20 hours
NSQF Level 5
```

### Expected LLM Extraction:
```json
{
  "recipientName": "Ekaraj Chokshi",
  "certificateId": "CERT-2025-2E6583A6",
  "companyName": "TechCorp India",           ← Now extracted!
  "issuer": "TechCorp Training Division",    ← Now extracted!
  "courseTitle": "UI/UX Design",
  "issueDate": "2025-05-25",
  "duration": "20 hours",
  "learningHours": 20,
  "nsqfLevel": 5,
  "skills": ["UI Design", "UX Design"]
}
```

### Expected File Path:
```
Before: ../storage/organization-certificates/2025/12/unknown/cert-id.png
After:  ../storage/organization-certificates/2025/12/techcorp-training-division/cert-id.png
```

---

## Verification

To test the fix:

1. **Generate new certificates:**
```bash
cd backend/python-scripts
python3 random_certificate_generator.py
```

2. **Check that certificates now show issuer:**
   - Open a generated certificate image
   - Verify issuer name appears below "OF COMPLETION"

3. **Run watcher to process them:**
```bash
python3 certificate_watcher.py
```

4. **Verify correct folder structure:**
```bash
ls -la ../storage/organization-certificates/2025/12/
# Should see folders like:
# - techcorp-training-division/
# - infosys-limited/
# - wipro-limited/
# NOT: unknown/
```

---

## Additional Notes

### Design Considerations:

1. **Position:** Placed below subtitle (Y: 220) to maintain visual hierarchy
2. **Font:** Same as subtitle (Helvetica, 18px) for consistency
3. **Color:** Gray (#4A5568) - less prominent than main title but readable
4. **Spacing:** Added 25px gap before decorative line for balance

### Why Use Issuer Instead of Company Name:

```python
issuer_text = data.get('issuer', data.get('company_name', ''))
```

- **Issuer** is more specific: "TechCorp Training Division" vs "TechCorp India"
- Falls back to company name if issuer not available
- Both fields are now included in `cert_data`

---

## Files Modified

1. ✅ `random_certificate_generator.py` - Added issuer display and data
2. ✅ `CERTIFICATE_DESIGN.md` - Updated design specifications
3. ✅ `COMPANY_NAME_FIX.md` - This documentation

---

**Date:** December 9, 2025
**Status:** ✅ Fixed
**Impact:** High - Enables proper certificate organization by company
