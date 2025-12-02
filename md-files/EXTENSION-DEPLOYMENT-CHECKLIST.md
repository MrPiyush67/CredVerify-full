# Extension Update Deployment Checklist

## ✅ Pre-Deployment Verification

### Code Changes Completed
- [x] Updated `extension/js/popup.js` for new response structure
- [x] Changed field mappings (`courseName` → `certificateName`)
- [x] Added early rejection handling (UNTRUSTED_DOMAIN, NAME_MISMATCH)
- [x] Created `displayEarlyRejection()` function
- [x] Synced `backend/platforms.json` with extension
- [x] Verified `background.js` compatibility
- [x] Checked `login.js` (no changes needed)

### Documentation Created
- [x] `EXTENSION-CLEAN-ARCHITECTURE-UPDATE.md` - Full technical docs
- [x] `CLEAN-ARCHITECTURE-SUMMARY.md` - Executive summary
- [x] `EXTENSION-UPDATE-QUICK-REFERENCE.md` - Quick reference guide
- [x] `EXTENSION-DEPLOYMENT-CHECKLIST.md` - This checklist

### Files Verified
- [x] No errors in extension JavaScript files
- [x] All required functions implemented
- [x] Response parsing updated everywhere
- [x] Early rejection routing added

## 🧪 Testing Required

### Basic Functionality
- [ ] Extension loads without errors
- [ ] Login works correctly
- [ ] Platform whitelist loads (check console for "Loaded X platforms")
- [ ] Domain detection works on whitelisted sites

### Successful Verification
- [ ] Upload certificate from Udemy
- [ ] Upload certificate from Coursera  
- [ ] Upload certificate from other trusted platform
- [ ] Verify all fields display: certificateName, issuer, recipientName, issueDate, duration
- [ ] Check name validation shows confidence score
- [ ] Check domain validation shows trusted status
- [ ] Verify "Save to CredVerify" button works

### Early Rejection: UNTRUSTED_DOMAIN
- [ ] Upload certificate from non-whitelisted domain
- [ ] Should see "❌ Untrusted Domain" alert
- [ ] Should show domain validation card with:
  - Domain name
  - "Not Trusted" badge
  - Reason for rejection
- [ ] Should NOT make LLM call (check backend logs)

### Early Rejection: NAME_MISMATCH
- [ ] Upload certificate with significantly different name
- [ ] Should see "❌ Name Mismatch" alert
- [ ] Should show name comparison card with:
  - Your name (from profile)
  - Name on certificate
  - Confidence score (< 85%)
  - Reason
- [ ] Should NOT make LLM call (check backend logs)

### Edge Cases
- [ ] Invalid image file (should error gracefully)
- [ ] Network error (should show user-friendly message)
- [ ] Backend offline (should handle connection error)
- [ ] Very large image (should handle without crashing)
- [ ] Certificate with no name (should handle gracefully)
- [ ] Certificate with multiple names (should handle)

## 🔍 Console Checks

### Extension Console (popup.js)
Expected logs for successful verification:
```
📱 [POPUP] verifyCertificate() called
📱 [POPUP] Converting blob to base64...
📱 [POPUP] ✅ Base64 length: XXXXX characters
📱 [POPUP] 📤 Sending message to background script...
📱 [POPUP] 📥 Received response from background
📱 [POPUP] ✅ Certificate saved to database
```

Expected logs for early rejection:
```
📱 [POPUP] verifyCertificate() called
📱 [POPUP] Converting blob to base64...
📱 [POPUP] 📤 Sending message to background script...
📱 [POPUP] 📥 Received response from background
(Shows rejection alert and details)
```

### Background Service Worker (background.js)
Expected logs:
```
✅ Loaded X platforms with Y domains
📋 Sample domains: [...]
🔍 Checking domain: udemy.com
✅ Is whitelisted? true
📍 Platform: Udemy (mooc)
🔧 [BACKGROUND] Starting verification...
🔧 [BACKGROUND] ✅ Using base64 from fileData
🔧 [BACKGROUND] 📤 Sending to backend
🔧 [BACKGROUND] 📥 Response received after XXX ms
🔧 [BACKGROUND] ✅ Verification successful!
```

### Backend Logs
Look for:
```
[Domain Validation] Checking domain: udemy.com
[Domain Validation] ✅ Domain is trusted
[Name Validation] Comparing names...
[Name Validation] ✅ High confidence match (95%)
[LLM Service] Making LLM call for verification...
```

OR for early rejection:
```
[Domain Validation] Checking domain: unknown.com
[Domain Validation] ❌ Domain not trusted
[Early Rejection] UNTRUSTED_DOMAIN - skipping LLM
```

## 📊 Performance Monitoring

### Metrics to Track
- [ ] Time to verify (should be 2-5 seconds for valid certs)
- [ ] Early rejection time (should be < 1 second)
- [ ] LLM call rate (should decrease with more rejections)
- [ ] Error rate (should be low)
- [ ] User satisfaction (check rejection reasons are clear)

### Cost Monitoring
- [ ] Count LLM calls per day (should decrease)
- [ ] Count early rejections per day (should increase initially)
- [ ] Calculate cost savings (rejected certs don't use LLM)

## 🐛 Debugging Guide

### Issue: Extension shows "undefined" for fields
**Cause**: Using old field names  
**Fix**: Check for `courseName` → should be `certificateName`

### Issue: Early rejections not showing
**Cause**: Error type detection not working  
**Fix**: Check `response.data?.error?.type` exists

### Issue: All verifications failing
**Cause**: Backend not running or wrong endpoint  
**Fix**: Check `chrome.storage.local.get(['cv_endpoint'])`

### Issue: Domain always untrusted
**Cause**: platforms.json not loaded  
**Fix**: Check background.js console for "Loaded X platforms"

### Issue: Name always mismatched
**Cause**: User profile name different from certificate  
**Fix**: Check name validation logic, may need to adjust threshold

## 🚀 Deployment Steps

### 1. Backend Deployment
- [ ] Deploy updated `backend/platforms.json`
- [ ] Verify all platforms loaded correctly
- [ ] Test API endpoints respond correctly
- [ ] Monitor logs for early rejections

### 2. Extension Deployment (Development Testing)
- [ ] Load unpacked extension in Chrome
- [ ] Test all scenarios above
- [ ] Fix any issues found
- [ ] Get user feedback

### 3. Extension Deployment (Production)
- [ ] Update version in `manifest.json`
- [ ] Create changelog
- [ ] Package extension
- [ ] Submit to Chrome Web Store
- [ ] Monitor user reviews

### 4. Post-Deployment Monitoring
- [ ] Monitor error rates
- [ ] Check rejection patterns
- [ ] Verify cost savings
- [ ] Collect user feedback
- [ ] Adjust whitelist/thresholds as needed

## 📝 Rollback Plan

If issues are found:

### Quick Rollback (Extension)
1. Revert to previous extension version
2. Redeploy from backup
3. Notify users of issue

### Partial Rollback (Backend)
1. Disable early rejection checks
2. Process all certificates through LLM
3. Fix issues in clean architecture
4. Re-enable early rejection

### Full Rollback (Both)
1. Revert backend to old architecture
2. Revert extension to old response parsing
3. Investigate and fix issues
4. Plan re-deployment

## ✅ Sign-Off

Before deploying, confirm:

- [ ] All code changes reviewed
- [ ] All tests passed
- [ ] Documentation complete
- [ ] Stakeholders notified
- [ ] Rollback plan ready
- [ ] Monitoring in place

**Deployed By**: ________________  
**Date**: ________________  
**Version**: ________________

---

## 📞 Support Contacts

**Technical Issues**: Check console logs first  
**Backend Issues**: Check backend logs  
**User Issues**: Check error messages displayed

**Files to Check**:
- Extension errors: Open popup, F12, Console tab
- Background errors: chrome://extensions → Service Worker → Inspect
- Backend errors: Check backend server logs

## 🎯 Success Criteria

Deployment is successful when:
- ✅ All tests passed
- ✅ No critical errors in console
- ✅ Early rejections working correctly
- ✅ Valid certificates verified successfully  
- ✅ Error messages clear and helpful
- ✅ Performance improved (faster rejections)
- ✅ Cost reduced (fewer LLM calls)
- ✅ User feedback positive

---

**Last Updated**: 2024  
**Status**: Ready for Testing  
**Next Step**: Complete testing checklist above
