# Certificate Design Specifications

## 📐 Updated Certificate Design (v2.0)

### Overview
Professional certificate design with decorative borders, brand colors, and prominent certificate ID display.

---

## 🎨 Design Elements

### 1. **Background**
- Color: `#F5F5DC` (Beige/Cream) - Professional look
- Dimensions: 1123px × 794px (A4 Landscape at 96 DPI)

### 2. **Border Design**
- **Outer Border:**
  - Color: `#116466` (Brand Teal)
  - Width: 8px
  - Margin: 30px from edge

- **Inner Border:**
  - Color: `#D4AF37` (Gold)
  - Width: 2px
  - Margin: 15px from outer border

### 3. **Color Palette**
```python
PRIMARY = (17, 100, 102)   # #116466 - Brand Teal
BLACK = (0, 0, 0)          # #000000 - Text
GRAY = (74, 85, 104)       # #4A5568 - Secondary Text
GOLD = (212, 175, 55)      # #D4AF37 - Accents/Lines
BEIGE = '#F5F5DC'          # Background
```

---

## 📝 Content Layout

### **Header Section** (Top)

#### Certificate ID (Top Right)
- Position: `(width - 80, 60)` - Right aligned
- Format: `ID: CERT-2024-12345678`
- Font: Helvetica, 18px
- Color: Brand Teal (#116466)
- **Purpose:** Replaces old certificate URL

### **Title Section** (Y: 150-220)

#### Main Title
- Text: "CERTIFICATE"
- Position: Center, Y: 150
- Font: Times New Roman Bold, 56px
- Color: Brand Teal (#116466)

#### Subtitle
- Text: "OF COMPLETION"
- Position: Center, Y: 195
- Font: Helvetica, 18px
- Color: Black

#### Issuer/Company Name
- Text: Organization issuer name (e.g., "Infosys Limited", "TechCorp Training Division")
- Position: Center, Y: 220
- Font: Helvetica, 18px
- Color: Gray (#4A5568)
- **Purpose:** Identifies the issuing organization for LLM extraction

#### Decorative Line
- Position: Center, Y: 245
- Length: 400px
- Color: Gold
- Width: 3px

---

### **Body Section** (Y: 280-460)

#### "This is to certify that" (Y: 280)
- Font: Helvetica, 18px
- Color: Gray
- Position: Center aligned

#### Recipient Name (Y: 330)
- Font: Times New Roman Bold Italic, 56px
- Color: Black
- Position: Center aligned
- **Underline:**
  - Y Position: 365
  - Extends 60px beyond name on each side
  - Color: Gold
  - Width: 3px

#### "has successfully completed" (Y: 400)
- Font: Helvetica, 18px
- Color: Gray
- Position: Center aligned

#### Course Title (Y: 460)
- Font: Helvetica, 38px (Bold)
- Color: Brand Teal (#116466)
- Transform: UPPERCASE
- Position: Center aligned

---

### **Footer Section** (Y: footer_y = height - 140)

#### Decorative Line (Above Footer)
- Position: Y: footer_y - 20
- Spans from margin to margin (with 50px padding)
- Color: Gold
- Width: 2px

#### Left Column (X: 100)
**Issue Date:**
- Label: "Issue Date:" (Gray, 18px)
- Value: "Dec 09, 2024" (Black, 18px)
- Spacing: 25px between label and value

**Duration:**
- Label: "Duration:" (Gray, 18px)
- Value: "7.5-30 hours" range (Black, 18px)
- Format: Decimal hours shown as needed (7.5, 8, 8.5, etc.)
- Spacing: 25px between label and value
- Vertical Gap: 55px from date section

#### Center Column (X: width/2)
**Instructor Signature:**
- Signature Line: 200px wide (Black, 2px)
- Position: Y: footer_y + 10
- Instructor Name: Times New Roman, 18px (Black)
  - Position: 10px below line
- Label: "Instructor" (Gray, 18px)
  - Position: 23px below name

#### Right Column (X: width - 180)
**QR Code:**
- Size: 110px × 110px
- White background: 120px × 120px (5px padding)
- Data: `https://credverify.vercel.app/verify/{certificate_id}`
- Position: Y: footer_y - 10

**NSQF Level Badge:**
- Text: "NSQF Level 5"
- Font: Helvetica, 18px
- Color: Brand Teal
- Position: Below QR code (Y: qr_y + 125)
- Alignment: Center of QR code

---

## 🆕 Changes from Previous Version

### ❌ Removed:
1. **Certificate URL at top** - Replaced with Certificate ID
2. **Plain white background** - Changed to professional beige
3. **Simple black borders** - Replaced with dual-color decorative borders
4. **Inline footer text** - Restructured into organized columns

### ✅ Added:
1. **Certificate ID prominently** - Top right, easily readable
2. **Decorative borders** - Teal outer border + Gold inner border
3. **Professional color scheme** - Brand teal (#116466) for key elements
4. **Gold accent lines** - Under title and above footer
5. **Beige background** - #F5F5DC for elegance
6. **"This is to certify that" text** - More formal structure
7. **"has successfully completed" text** - Better flow
8. **Instructor signature line** - Professional touch
9. **Organized footer layout** - Three-column structure
10. **White QR code background** - Better contrast

---

## 📏 Measurements & Positions

```
Certificate Dimensions: 1123px × 794px

┌─────────────────────────────────────────────────────┐
│ Border Margin: 30px                                 │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Inner Border: +15px                  ID: CERT-XX │ │
│ │                                                   │ │
│ │               CERTIFICATE                         │ │  Y: 150
│ │              OF COMPLETION                        │ │  Y: 195
│ │           TechCorp Training Division              │ │  Y: 220
│ │              ─────────────                        │ │  Y: 245
│ │                                                   │ │
│ │         This is to certify that                  │ │  Y: 280
│ │                                                   │ │
│ │            [Recipient Name]                       │ │  Y: 330
│ │            ─────────────────                      │ │  Y: 365
│ │                                                   │ │
│ │       has successfully completed                 │ │  Y: 400
│ │                                                   │ │
│ │        FULL STACK WEB DEVELOPMENT                │ │  Y: 460
│ │                                                   │ │
│ │  ───────────────────────────────────────────     │ │  Y: footer-20
│ │                                                   │ │
│ │  Issue Date:    [Signature Line]     [QR Code]   │ │
│ │  Dec 09, 2024   Instructor Name                  │ │  Footer Section
│ │                 Instructor           NSQF Level 5 │ │  Y: height-140
│ │  Duration:                                        │ │
│ │  15.5 hours                                       │ │
│ │                                                   │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 🔤 Font Specifications

### Loaded Fonts (with fallbacks):
```python
try:
    title_font = ImageFont.truetype(
        '/System/Library/Fonts/Supplemental/Times New Roman.ttf', 48
    )
    course_font = ImageFont.truetype(
        '/System/Library/Fonts/Helvetica.ttc', 36
    )
    name_font = ImageFont.truetype(
        '/System/Library/Fonts/Supplemental/Times New Roman Italic.ttf', 52
    )
    info_font = ImageFont.truetype(
        '/System/Library/Fonts/Helvetica.ttc', 16
    )
except:
    # Fallback to PIL default fonts
    title_font = ImageFont.load_default()
    course_font = ImageFont.load_default()
    name_font = ImageFont.load_default()
    info_font = ImageFont.load_default()
```

### Font Usage:
| Element | Font | Size | Style |
|---------|------|------|-------|
| "CERTIFICATE" | Times New Roman | 48px | Bold |
| Course Title | Helvetica | 36px | Regular |
| Recipient Name | Times New Roman | 52px | Bold Italic |
| Body Text | Helvetica | 16px | Regular |
| Certificate ID | Helvetica | 18px | Regular |
| Footer Labels | Helvetica | 18px | Regular |

---

## 🎯 Key Improvements

### Visual Hierarchy:
1. **Certificate ID** - Immediately visible (top right)
2. **Title** - Bold, large, centered (brand color)
3. **Recipient Name** - Italicized, emphasized with gold underline
4. **Course** - UPPERCASE, brand color
5. **Details** - Organized footer with clear sections

### Professional Elements:
- ✅ Dual-color decorative borders
- ✅ Gold accent lines for elegance
- ✅ Beige background (not harsh white)
- ✅ Instructor signature line
- ✅ Well-organized footer layout
- ✅ High-contrast QR code with white background

### Readability:
- Clear visual separation between sections
- Adequate white space
- Consistent color usage
- Proper font sizing and weights

---

## 📦 Export Format

- **Format:** PNG
- **Encoding:** Base64
- **Quality:** High (no compression)
- **Color Mode:** RGB
- **Prefix:** `data:image/png;base64,{base64_string}`

---

## 🔍 Verification QR Code

The QR code encodes:
```
https://credverify.vercel.app/verify/{certificate_id}
```

- **Purpose:** Quick verification via blockchain
- **Size:** 110px × 110px
- **Background:** White (120px × 120px with 5px padding)
- **Position:** Bottom right corner
- **Border:** 1px
- **Box Size:** 4px per module

---

## 🎨 Sample Output

When generated, the certificate will have:
- Professional beige background
- Teal and gold decorative borders
- Certificate ID prominently displayed (top right)
- Elegant typography with proper hierarchy
- Three-column footer with QR code
- All information clearly organized

---

**Last Updated:** December 9, 2024
**Version:** 2.0
**Status:** Production Ready ✅
