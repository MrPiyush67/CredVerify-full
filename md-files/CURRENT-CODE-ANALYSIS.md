# Current Code Analysis - Verification System

## 📊 Current Structure

### ✅ **Good Things Already in Place:**

1. **Proper separation of concerns** - You have:
   - `ocr/ocr.service.js` - Text extraction
   - `llm/llm.service.js` - LLM extraction
   - `validation/nameMatcher.service.js` - Name validation
   - `validation/domainValidator.service.js` - Domain validation
   - `verification/verification.service.js` - Main orchestration
   - `processing/postProcessor.service.js` - Data cleaning

2. **Name matching logic exists** - `compareNames()` and `fuzzyMatchName()` with:
   - First + Last name matching (handles middle name variations)
   - String similarity using `string-similarity` library
   - Confidence thresholds (85% for match)

3. **Domain whitelist exists** - `TRUSTED_DOMAINS` array with 30+ platforms

4. **Weighted scoring system** - 60% name, 30% domain, 10% metadata

5. **Three-tier verification**:
   - VERIFIED (auto-approved)
   - REVIEW_REQUIRED (manual review)
   - REJECTED (auto-rejected)

---

## ❌ **Critical Problems (ChatGPT is Right):**

### 1. **LLM is trusted for personName (WRONG)**
**Current flow:**
```
OCR → LLM extracts personName → nameMatcher compares it
```

**Problem:** LLM can hallucinate/misread the name, then you compare hallucination with legal name.

**What ChatGPT recommends:**
```
OCR → Find best name match in raw OCR text → Compare with legal name
```

---

### 2. **LLM extracts issuerName/companyName (WRONG)**
**Current flow:**
```
LLM extracts issuerName → Domain validator tries to match it
```

**Problem:** LLM might say "Google" when domain is "coursera.org"

**What ChatGPT recommends:**
```
Domain whitelist lookup → Use whitelist issuer name (ignore LLM)
```

---

### 3. **Massive LLM prompt (105 lines!)**
- Asking LLM to extract 15+ fields
- Asking it to make critical decisions (person name, issuer)
- Complex instructions that can confuse the model

**What ChatGPT recommends:**
- LLM should ONLY extract: courseName, duration, grade, skills, description
- Your code decides: personName, companyName, verificationLink

---

### 4. **Regex fallback is complex but unused**
- 380 lines in `llm.service.js`
- Regex patterns for all fields
- Probably never triggers because LLM rarely fails completely

---

### 5. **nameValidator logic is over-complicated**
- 184 lines of code
- Multiple functions: `compareNames`, `fuzzyMatchName`, `findBestNameFromOcr`, `extractNameCandidates`
- Lots of edge cases and special handling

**What ChatGPT recommends:**
- One simple function: `findBestNameMatchFromOcr(ocrText, legalName)`
- Return: `{ bestMatch, confidence, reason }`

---

## 🎯 **What Needs to Change:**

### Priority 1: **Stop trusting LLM for critical fields**
- ❌ Remove `personName` extraction from LLM
- ❌ Remove `companyName`/`issuerName` extraction from LLM  
- ❌ Remove `verificationLink` extraction from LLM
- ✅ Keep: courseName, duration, grade, skills, description

### Priority 2: **Implement domain → issuer mapping**
Create `TRUSTED_ISSUERS` structure:
```js
{
  id: 'unstop',
  name: 'Unstop',
  domains: ['unstop.com', 'dare2compete.com'],
  aliases: ['Unstop', 'Dare2Compete']
}
```

### Priority 3: **Implement direct OCR name matching**
New function in `nameMatcher.service.js`:
```js
findBestNameMatchFromOcr(ocrText, legalName)
// Extract name candidates from OCR
// Compare each with legal name
// Return best match + confidence
```

### Priority 4: **Simplify verification flow**
```js
// NEW FLOW:
1. OCR extraction
2. Name matching (OCR → legal name, NO LLM)
3. Domain validation (whitelist lookup, NO LLM)
4. LLM extraction (ONLY soft fields)
5. Build final extractedData (use domain whitelist for issuer)
6. Calculate score & determine status
```

---

## 📁 **Files to Modify:**

### 🔴 Major Changes:
1. **`llm/llm.service.js`** - Simplify prompt, remove critical fields
2. **`validation/nameMatcher.service.js`** - Add `findBestNameMatchFromOcr()`
3. **`validation/domainValidator.service.js`** - Add `TRUSTED_ISSUERS` + `resolveIssuerFromUrl()`
4. **`verification/verification.service.js`** - Rewrite main flow

### 🟡 Minor Changes:
5. **`verification/verification.controller.js`** - Update to use new flow

### ⚪ Keep as-is:
- `ocr/ocr.service.js` ✅
- `processing/postProcessor.service.js` ✅ (might need minor tweaks)
- `credential.model.js` ✅
- `credential.controller.js` ✅

---

## 🚀 **Implementation Plan:**

### Step 1: Domain/Issuer Whitelist (30 min)
- Add `TRUSTED_ISSUERS` array to `domainValidator.service.js`
- Add `resolveIssuerFromUrl(url)` function
- Test with 5-10 real URLs

### Step 2: Name Matching from OCR (45 min)
- Add `findBestNameMatchFromOcr(ocrText, legalName)` to `nameMatcher.service.js`
- Use regex to extract name candidates from OCR
- Use `string-similarity` to find best match
- Test with real OCR text

### Step 3: Refactor Main Verification (60 min)
- Update `processCertificateImage()` in `verification.service.js`
- Call new name matcher BEFORE LLM
- Call domain resolver BEFORE LLM
- Reject early if name/domain fails
- Let LLM extract only soft fields

### Step 4: Simplify LLM Prompt (20 min)
- Remove personName, companyName, verificationLink from prompt
- Focus on: courseName, duration, grade, skills, description
- Remove complex instructions

### Step 5: Update Controller (10 min)
- Update `verification.controller.js` if needed
- Test end-to-end flow

---

## 📝 **Testing Strategy:**

1. Test with Udemy certificate (pageUrl: udemy.com)
2. Test with Coursera certificate
3. Test with unknown domain → should fail early
4. Test with wrong name → should fail early
5. Test with correct everything → should auto-verify

---

## 💡 **Expected Improvements:**

✅ **Faster** - Reject bad requests early (before LLM)  
✅ **Cheaper** - Smaller LLM prompts  
✅ **More accurate** - No LLM hallucinations for critical fields  
✅ **More explainable** - Clear decision logic (for SIH judges)  
✅ **More maintainable** - Simpler code, easier to debug  

---

**Next Step:** Start with Step 1 (Domain/Issuer Whitelist)
