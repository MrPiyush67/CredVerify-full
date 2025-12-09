# Course Duration Update - Certificate Generation

## Summary
Updated the certificate generation system to use a more realistic course duration range of **7.5 to 30 hours** (previously 20-200 hours).

---

## Changes Made

### 1. Configuration Update
**File:** `backend/python-scripts/config.json`

```json
// BEFORE:
"hours_range": {
  "min": 20,
  "max": 200
}

// AFTER:
"hours_range": {
  "min": 7.5,
  "max": 30
}
```

### 2. Random Hours Generator Function
**File:** `backend/python-scripts/random_certificate_generator.py`

**Updated Function:**
```python
def generate_random_hours():
    """Generate random learning hours between min and max (supports decimals)"""
    hours_range = CONFIG.get('hours_range', {'min': 7.5, 'max': 30})
    min_hours = hours_range['min']
    max_hours = hours_range['max']

    # Generate random float and round to 0.5 increments for cleaner values
    random_hours = random.uniform(min_hours, max_hours)
    # Round to nearest 0.5 (e.g., 7.5, 8.0, 8.5, 9.0, etc.)
    return round(random_hours * 2) / 2
```

**Key Changes:**
- Changed from `random.randint()` (integers only) to `random.uniform()` (supports decimals)
- Rounds to nearest 0.5 for cleaner values (7.5, 8.0, 8.5, 9.0, etc.)
- Supports minimum of 7.5 hours (half-day courses)

### 3. Certificate Image Display Formatting
**File:** `backend/python-scripts/random_certificate_generator.py`

**Line 181-184:** Updated certificate image duration display
```python
# Format hours nicely (remove .0 for whole numbers, show decimals otherwise)
hours_text = f"{data['hours']:.1f}".rstrip('0').rstrip('.') if data['hours'] % 1 != 0 else str(int(data['hours']))
draw.text((left_x, footer_y + 80), f"{hours_text} hours", fill=BLACK, font=info_font)
```

**Examples:**
- `7.5` → displays as "7.5 hours"
- `8.0` → displays as "8 hours"
- `15.5` → displays as "15.5 hours"
- `20.0` → displays as "20 hours"

### 4. API Payload Formatting
**File:** `backend/python-scripts/random_certificate_generator.py`

**Line 315-316:** Updated API payload duration string
```python
# Format hours nicely for display (remove .0 for whole numbers)
hours_display = f"{hours:.1f}".rstrip('0').rstrip('.') if hours % 1 != 0 else str(int(hours))

api_data = {
    # ...
    'duration': f"{hours_display} hours",
    'learningHours': hours,  # Keeps the numeric value
    # ...
}
```

### 5. Documentation Update
**File:** `backend/python-scripts/CERTIFICATE_DESIGN.md`

Updated duration specification:
```markdown
**Duration:**
- Label: "Duration:" (Gray, 18px)
- Value: "7.5-30 hours" range (Black, 18px)
- Format: Decimal hours shown as needed (7.5, 8, 8.5, etc.)
```

---

## Rationale for Changes

### Why 7.5-30 Hours?

1. **More Realistic for Micro-credentials:**
   - Short courses (7.5 hours = 1 day)
   - Multi-day workshops (15 hours = 2 days)
   - Week-long programs (30 hours = 4 days)

2. **Aligns with Industry Standards:**
   - NSQF Level 3-7 micro-credentials typically range from 1-4 days
   - Online courses often 8-25 hours
   - Professional certifications usually under 30 hours

3. **Previous Range Issues:**
   - 20-200 hours was too broad
   - 200 hours = 5 weeks full-time (unrealistic for organization certificates)

### Why Round to 0.5 Increments?

- **Cleaner Values:** 7.5, 8.0, 8.5 look more professional than 7.3478
- **Realistic:** Courses typically run in 30-minute blocks
- **User-Friendly:** Easier to understand and verify

---

## Testing

### Test the Changes

1. **Generate a test certificate:**
```bash
cd backend/python-scripts
python3 random_certificate_generator.py
```

2. **Verify duration range:**
   - Check generated certificates have duration between 7.5-30 hours
   - Verify decimal hours display correctly (e.g., "7.5 hours", "15.5 hours")
   - Ensure whole numbers don't show ".0" (e.g., "8 hours" not "8.0 hours")

3. **Check API payload:**
   - `duration` field should be formatted string ("15.5 hours")
   - `learningHours` field should be numeric value (15.5)

### Expected Output Examples

```
Duration: 7.5 hours   ✅
Duration: 8 hours     ✅
Duration: 15.5 hours  ✅
Duration: 22 hours    ✅
Duration: 30 hours    ✅

Duration: 8.0 hours   ❌ (should show as "8 hours")
Duration: 6 hours     ❌ (below minimum)
Duration: 35 hours    ❌ (above maximum)
```

---

## Database Impact

### No Schema Changes Required

The backend accepts both integer and float values:
- `learningHours` field stores numeric value (Number type in MongoDB)
- `duration` field stores formatted string ("15.5 hours")

### Existing Certificates

Old certificates with 20-200 hour ranges remain valid. Only new certificates will use the 7.5-30 hour range.

---

## Certificate Image Examples

### Before (20-200 hours range):
```
Issue Date:              [Signature]           [QR]
Dec 09, 2024            John Smith
                        Instructor        NSQF Level 5
Duration:
120 hours
```

### After (7.5-30 hours range):
```
Issue Date:              [Signature]           [QR]
Dec 09, 2024            John Smith
                        Instructor        NSQF Level 5
Duration:
15.5 hours
```

---

## Files Modified

1. ✅ `backend/python-scripts/config.json` - Updated hours_range config
2. ✅ `backend/python-scripts/random_certificate_generator.py` - Updated generator logic
3. ✅ `backend/python-scripts/CERTIFICATE_DESIGN.md` - Updated documentation

---

## Rollback Instructions

If you need to revert to the old range:

1. **Edit `config.json`:**
```json
"hours_range": {
  "min": 20,
  "max": 200
}
```

2. **Edit `random_certificate_generator.py`:**
```python
def generate_random_hours():
    hours_range = CONFIG.get('hours_range', {'min': 20, 'max': 200})
    return random.randint(hours_range['min'], hours_range['max'])
```

---

## Additional Notes

### Future Enhancements

1. **Course-Specific Duration Ranges:**
   - Different courses could have different typical durations
   - Example: "5G Technology" might be 20-30 hours, while "Python Basics" is 8-12 hours

2. **Configurable Rounding:**
   - Allow configuration for rounding (0.5, 0.25, or 1.0 hour increments)

3. **Validation:**
   - Add backend validation to ensure submitted hours fall within acceptable range
   - Warn if hours seem unrealistic for the course type

---

**Updated:** December 9, 2024
**Status:** ✅ Production Ready
**Impact:** Low (backward compatible)
