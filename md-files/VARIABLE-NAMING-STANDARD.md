# Variable Naming Standard - CredVerify

## 🎯 Purpose
This document defines the **canonical variable names** used throughout the CredVerify codebase to prevent errors and confusion.

---

## 📋 Standard Variable Names

### **Person/Recipient Information**

| Variable Name | Meaning | Where Used | Database Field |
|---------------|---------|------------|----------------|
| `recipientName` | The person's name **as shown on the certificate** | Backend processing, Extension | `certificateName` (schema) |
| `legalName` | The user's **legal name from their profile** | Backend validation, User model | `name` (user schema) |
| `legalNameSnapshot` | Snapshot of legal name at time of credential save | Database only | `legalNameSnapshot` (credential schema) |

**⚠️ CRITICAL**: The database field `certificateName` stores the **recipient's name**, NOT the course name!

### **Course/Certificate Information**

| Variable Name | Meaning | Where Used | Database Field |
|---------------|---------|------------|----------------|
| `courseTitle` | The name of the course/program/certificate | Backend processing, Extension | `title` (schema) |
| `credentialTitle` | Alternative name for course/program title | Can be used interchangeably with `courseTitle` | `title` (schema) |

**Examples**: 
- "Full Stack Web Development"
- "AWS Solutions Architect Certification"
- "Data Science Specialization"

### **Issuer/Organization Information**

| Variable Name | Meaning | Where Used | Database Field |
|---------------|---------|------------|----------------|
| `issuerName` | The organization that issued the certificate | Backend processing, Extension | `issuer` (schema) |
| `organizationName` | Alternative name for issuer | Can be used interchangeably | `issuer` (schema) |

**Examples**:
- "Udemy"
- "Coursera"
- "Google"
- "Microsoft"

### **Other Certificate Fields**

| Variable Name | Meaning | Database Field |
|---------------|---------|----------------|
| `certificateId` | Unique ID/number on the certificate | `credentialId` |
| `issueDate` | Date the certificate was issued | `issueDate` |
| `completionDate` | Date the course was completed | Stored in `meta` |
| `duration` | Course duration (e.g., "6 weeks") | Stored in `meta` |
| `learningHours` | Total learning hours | `totalHours` |
| `nsqfLevel` | NSQF level (1-10) | `nsqfLevel` |
| `skills` | Array of skills learned | `skills` |
| `grade` | Grade/score achieved | Stored in `meta` |

---

## 🔧 Correct Usage Examples

### Backend - verification.service.js
```javascript
const extractedData = {
  // Person information
  recipientName: nameMatch.bestMatch,        // ✅ Person's name from certificate
  
  // Course information
  courseTitle: llmMetadata.certificateName,  // ✅ Course/program name
  
  // Issuer information
  issuerName: domainValidation.issuer.name,  // ✅ Organization name
  
  // Other fields
  duration: llmMetadata.duration,
  learningHours: llmMetadata.learningHours,
  certificateId: llmMetadata.certificateId,
};
```

### Database - credential.model.js
```javascript
{
  certificateName: "John Smith",              // ✅ Recipient's name
  legalNameSnapshot: "John Michael Smith",    // ✅ User's legal name
  title: "Full Stack Development",            // ✅ Course title
  issuer: "Udemy",                            // ✅ Issuer name
  credentialId: "UC-12345678",                // ✅ Certificate ID
}
```

### Extension - popup.js
```javascript
// Display recipient name
<span>${extractedData.recipientName}</span>     // ✅ Person's name

// Display course title
<span>${extractedData.courseTitle}</span>       // ✅ Course name

// Display issuer
<span>${extractedData.issuerName}</span>        // ✅ Organization
```

---

## ❌ Deprecated/Confusing Names (DO NOT USE)

| ❌ Don't Use | ✅ Use Instead | Reason |
|-------------|---------------|---------|
| `personName` | `recipientName` | More specific and clear |
| `certificateName` (for course) | `courseTitle` | Conflicts with schema field (which stores person name) |
| `companyName` | `issuerName` | Not all issuers are companies (universities, etc.) |
| `courseName` | `courseTitle` | `title` is the schema field name |

---

## 🗺️ Data Flow Map

### 1. **LLM Extraction** (llm.service.js)
```javascript
// LLM returns (OLD format - needs fixing):
{
  certificateName: "Full Stack Development",  // ❌ Actually the COURSE title
  // No personName field - extracted from OCR instead
}
```

### 2. **Name Matching** (nameMatcher.service.js)
```javascript
// Matches person's name from OCR
{
  bestMatch: "John Smith",  // Person's name from certificate
  confidence: 95
}
```

### 3. **Domain Validation** (domainValidator.service.js)
```javascript
{
  issuer: {
    name: "Udemy",  // Organization name
    domain: "udemy.com"
  }
}
```

### 4. **Verification Service** (verification.service.js)
```javascript
const extractedData = {
  recipientName: nameMatch.bestMatch,         // ✅ Person
  courseTitle: llmMetadata.certificateName,   // ✅ Course (from LLM)
  issuerName: domainValidation.issuer.name,   // ✅ Org (from domain)
};
```

### 5. **Database Save** (credential.model.js)
```javascript
{
  certificateName: extractedData.recipientName,  // ✅ Maps to person
  title: extractedData.courseTitle,              // ✅ Maps to course
  issuer: extractedData.issuerName,              // ✅ Maps to org
}
```

### 6. **Extension Display** (popup.js)
```javascript
// Shows to user:
recipientName: "John Smith"           // Who received it
courseTitle: "Full Stack Development" // What they completed
issuerName: "Udemy"                   // Who issued it
```

---

## 🔍 Schema Field Mapping

### Credential Schema → Processing Variables

| Schema Field | Processing Variable | Meaning |
|--------------|---------------------|---------|
| `certificateName` | `recipientName` | Person's name on certificate |
| `legalNameSnapshot` | `legalName` | User's legal name from profile |
| `title` | `courseTitle` | Course/certificate title |
| `issuer` | `issuerName` | Issuing organization |
| `credentialId` | `certificateId` | Certificate number/ID |
| `totalHours` | `learningHours` | Total learning hours |
| `nsqfLevel` | `nsqfLevel` | NSQF level (1-10) |

### User Schema → Processing Variables

| Schema Field | Processing Variable | Meaning |
|--------------|---------------------|---------|
| `name` | `legalName` | User's immutable legal name |
| `username` | `username` | User's display username |
| `email` | `email` | User's email |

---

## 🚨 Common Mistakes to Avoid

### Mistake 1: Using `certificateName` for course title
```javascript
// ❌ WRONG - Confusing!
const courseInfo = {
  certificateName: "Full Stack Development"  // This looks like a person's name!
};

// ✅ CORRECT
const courseInfo = {
  courseTitle: "Full Stack Development"  // Clear!
};
```

### Mistake 2: Inconsistent naming across layers
```javascript
// ❌ WRONG - Different names in different places
// Backend: personName
// Frontend: recipientName  
// Database: certificateName

// ✅ CORRECT - Use recipientName everywhere in processing
const data = {
  recipientName: "John Smith"  // Consistent across all layers
};

// Then map to schema fields only when saving
credential.certificateName = data.recipientName;
```

### Mistake 3: Using LLM's `certificateName` for person
```javascript
// ❌ WRONG - LLM's certificateName is the COURSE title
const recipientName = llmMetadata.certificateName;  

// ✅ CORRECT - Get person name from OCR name matching
const recipientName = nameMatch.bestMatch;
```

---

## ✅ Validation Checklist

Before deploying code, verify:

- [ ] `recipientName` used for person's name (not `personName`, `certificateName`)
- [ ] `courseTitle` used for course/program name (not `certificateName`, `courseName`)
- [ ] `issuerName` used for organization (not `companyName`, `organizationName`)
- [ ] LLM prompt updated to return `courseTitle` instead of `certificateName`
- [ ] Extension popup.js displays using correct variable names
- [ ] Backend verification.service.js uses standard names
- [ ] Database mapping in saveCertificate() function is correct
- [ ] All console.log statements use correct variable names

---

## 📝 Migration Notes

### Files Requiring Updates

1. **backend/src/features/credential/llm/llm.service.js**
   - Change prompt: `certificateName` → `courseTitle`

2. **backend/src/features/credential/verification/verification.service.js**
   - Change: `personName` → `recipientName`
   - Change: LLM `certificateName` → `courseTitle`

3. **extension/js/popup.js**
   - Update all display fields to use `recipientName`, `courseTitle`, `issuerName`

4. **Documentation**
   - Update all API docs with correct variable names

---

## 🎓 Quick Reference

**Remember the 3 key fields**:

1. **WHO** received it? → `recipientName` (schema: `certificateName`)
2. **WHAT** did they complete? → `courseTitle` (schema: `title`)
3. **FROM** whom? → `issuerName` (schema: `issuer`)

---

Last Updated: December 2, 2025
Status: **CANONICAL** - Use this as the source of truth
