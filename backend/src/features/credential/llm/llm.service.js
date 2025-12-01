import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy initialize Gemini client
let genAI = null;
let model = null;

const getGeminiModel = () => {
  if (!model) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-2.5-flash (stable, free tier, fast and accurate)
    model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
  }
  return model;
};

/**
 * Extract structured certificate data from OCR text using Gemini LLM
 * @param {string} ocrText - Raw OCR text
 * @returns {Promise<object>} - Structured certificate data
 */
export async function extractCertificateDataWithLLM(ocrText) {
  try {
    const geminiModel = getGeminiModel();

    const prompt = `You are an expert certificate data extraction AI trained to process certificates from ANY platform (Udemy, Coursera, edX, LinkedIn Learning, Google, Microsoft, IBM, AWS, etc.). Extract ALL available information accurately.

🎯 CRITICAL EXTRACTION RULES:
1. Return ONLY valid JSON - NO markdown code blocks, NO explanations, NO extra text
2. Extract ALL fields you can find - use null for missing fields
3. Be flexible with field names and formats across different certificate types
4. Dates: Convert to ISO format YYYY-MM-DD (e.g., "Dec 1, 2024" → "2024-12-01")
5. Certificate IDs: Include any alphanumeric ID visible on the certificate

👤 PERSON NAME EXTRACTION (HIGHEST PRIORITY):
The recipient's name is THE MOST IMPORTANT field. Look for it in these locations:
- Immediately after phrases: "awarded to", "presented to", "certifies that", "This is to certify that", "has completed"
- Below "Certificate of Completion/Achievement/Excellence"
- In large/bold text near the top or center
- Between header and course name
- Look for 2-3 capitalized words (First [Middle] Last)
- NEVER confuse with: instructor names, course titles, company names, footer text

📜 CERTIFICATE/COURSE NAME:
- Main subject/course/achievement title
- Usually after person name
- May include: course codes, specializations, certification names

🎯 CRITICAL: PERSON NAME (Certificate Recipient)
- Extract the name of the person receiving the certificate
- This is THE MOST IMPORTANT field - extract it carefully
- Look for patterns: "awarded to", "presented to", "certifies that", name after header
- ⚠️ SKIP instructor names, teacher names, or any name labeled as "Instructor", "By", "From"
- ⚠️ SKIP titles like "Dr.", "Prof.", "Instructor" - extract only the actual recipient's name
- Common formats: "John Smith", "Maria Garcia Lopez", "Arun Kumar Patel"
- Usually appears prominently near the top or middle of the certificate

🏢 ISSUER/COMPANY:
- Organization that issued the certificate
- Platform names: Udemy, Coursera, edX, LinkedIn, Google, etc.
- Universities, Companies, Training providers

🔢 CERTIFICATE ID:
- Any unique identifier on the certificate
- Formats: UC-xxxxx (Udemy), verify/xxxxx (Coursera), alphanumeric codes
- Only extract if it contains numbers/letters (not generic text)

📅 DATES:
- Issue date, completion date, validity dates
- Convert ALL date formats to YYYY-MM-DD
- Common formats: "Dec 1, 2024", "01/12/2024", "December 1, 2024"

🔗 VERIFICATION LINK:
- Full URL for certificate verification
- Usually contains "verify", "certificate", "credential"

💡 SKILLS:
- Technical skills, tools, frameworks mentioned
- Extract from course name, description, or skills section
- Return as array

OCR TEXT TO ANALYZE:
${ocrText}

RETURN THIS EXACT JSON STRUCTURE:
{
  "personName": "Full name of certificate recipient (CRITICAL - MUST EXTRACT)",
  "certificateName": "Course/Certificate title (recommended)",
  "issuerName": "Issuing organization (recommended)",
  "companyName": "Company/Institution",
  "certificateId": "Unique identifier or null",
  "verificationLink": "Verification URL or null",
  "issueDate": "YYYY-MM-DD or null",
  "completionDate": "YYYY-MM-DD or null",
  "duration": "Course duration or null",
  "grade": "Grade/Score or null",
  "NSQFLevel": "NSQF level number or null",
  "learningHours": "Total hours number or null",
  "skills": ["skill1", "skill2"],
  "description": "Brief description or null"
}

JSON OUTPUT:`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON
    const data = JSON.parse(text);

    return data;
  } catch (error) {
    console.error('LLM Extraction Error:', error);
    throw new Error(`LLM extraction failed: ${error.message}`);
  }
}

/**
 * Fallback regex-based extraction if LLM fails
 * @param {string} ocrText - Raw OCR text
 * @returns {object} - Extracted data using regex
 */
export function extractCertificateDataWithRegex(ocrText) {
  const data = {
    personName: null,
    certificateName: null,
    issuerName: null,
    companyName: null,
    certificateId: null,
    verificationLink: null,
    issueDate: null,
    completionDate: null,
    duration: null,
    grade: null,
    NSQFLevel: null,
    learningHours: null,
    skills: [],
    description: null,
  };

  // Extract person name - UNIVERSAL patterns for all certificate types
  const namePatterns = [
    // Pattern 1: Udemy style - Name after "Instructors" line (skip instructor, get next name)
    /Instructors?\s+[^\n]+\n\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*\n/i,

    // Pattern 2: After certificate type header (most common)
    /Certificate of (?:Completion|Achievement|Excellence|Participation|Appreciation)\s*\n\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,

    // Pattern 3: Standard certificate phrases
    /(?:awarded to|presented to|hereby certifies that|this certifies that|this is to certify that|is awarded to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,

    // Pattern 4: "has completed" or "has successfully completed"
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s+has\s+(?:successfully\s+)?completed/i,

    // Pattern 5: Name/Recipient field
    /(?:name|recipient|student|participant)[:\ s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,

    // Pattern 6: Udemy/Coursera style - name on second/third line after header
    /^[^\n]*(?:Certificate|Completion|Achievement)[^\n]*\n\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*\n\s*has/im,

    // Pattern 7: Look for 2-3 capitalized words after newline (generic fallback)
    /\n\s*([A-Z][a-z]+\s+(?:[A-Z][a-z]+\s+)?[A-Z][a-z]+)\s*\n\s*(?:has|is|successfully)/i,

    // Pattern 7: LinkedIn Learning style
    /(?:Name|Learner)[:\ s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,

    // Pattern 8: After "to" in certificate statements
    /(?:is presented to|is hereby awarded to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
  ];

  // Common label words to exclude from person name extraction
  const excludedLabels = [
    'instructors', 'instructor', 'by', 'from', 'presented', 'awarded',
    'certificate', 'completion', 'achievement', 'authorized', 'signature',
    'date', 'reference', 'number', 'length', 'duration', 'hours', 'dr', 'prof'
  ];

  for (const pattern of namePatterns) {
    const match = ocrText.match(pattern);
    if (match && match[1]) {
      const extractedName = match[1].trim();

      // Check if extracted name contains any excluded label words
      const lowerName = extractedName.toLowerCase();
      const hasExcludedWord = excludedLabels.some(label =>
        lowerName.includes(label)
      );

      if (hasExcludedWord) {
        continue; // Skip this match, try next pattern
      }

      // Validate: should be 2-4 words, each capitalized
      const nameParts = extractedName.split(/\s+/);
      if (nameParts.length >= 2 && nameParts.length <= 4) {
        // Ensure all parts are capitalized (not all caps like 'CERTIFICATE')
        const isValidName = nameParts.every(part =>
          part[0] === part[0].toUpperCase() &&
          part.slice(1) === part.slice(1).toLowerCase()
        );
        if (isValidName) {
          data.personName = extractedName;
          break;
        }
      }
    }
  }

  // Extract certificate/course name - ENHANCED patterns
  const coursePatterns = [
    // Pattern 1: "has completed [COURSE NAME]"
    /has\s+(?:successfully\s+)?completed\s+(?:the\s+)?([A-Z][A-Za-z0-9\s:&\-\.]+?)(?:\n|course|program|certification|\.|,|authorized|online)/i,

    // Pattern 2: After certificate type
    /Certificate of (?:Completion|Achievement)\s*\n\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*\n\s*[^\n]*\s*\n\s*([A-Z][A-Za-z0-9\s:&\-\.]+?)(?:\n|authorized|online)/i,

    // Pattern 3: "certification in/for"
    /certification\s+(?:in|for)\s+([A-Za-z0-9\s:&\-\.]+?)(?:\n|authorized|issued|\.|,)/i,

    // Pattern 4: Course/Program field
    /(?:course|program|training)[:\ s]+([A-Za-z0-9\s:&\-\.]+?)(?:\n|\.|,|authorized)/i,

    // Pattern 5: "completed the [COURSE]"
    /completed\s+(?:the\s+)?([A-Z][A-Za-z0-9\s:&\-\.]+?)(?:course|program|training|certification|\n)/i,
  ];

  for (const pattern of coursePatterns) {
    const match = ocrText.match(pattern);
    if (match && match[1]) {
      const courseName = match[1].trim();
      // Clean up common artifacts
      const cleaned = courseName
        .replace(/\s+/g, ' ')
        .replace(/^(the|a|an)\s+/i, '')
        .trim();
      if (cleaned.length > 3 && cleaned.length < 200) {
        data.certificateName = cleaned;
        break;
      }
    }
  }

  // Extract issuer/organization - ENHANCED for all platforms
  const issuerPatterns = [
    // Known platforms (highest priority)
    /\b(Udemy|Coursera|edX|LinkedIn Learning|Google|Microsoft|IBM|AWS|Amazon Web Services|Oracle|Cisco|Adobe|Meta|Facebook|Apple|Salesforce|HubSpot|Khan Academy)\b/i,

    // Traditional patterns
    /(?:issued by|authorized by|provided by|offered by|from|by)\s+([A-Z][A-Za-z\s&]+?)(?:\.|,|\n)/i,
    /(?:organization|institution|provider|platform)[:\ s]+([A-Za-z\s&]+?)(?:\.|,|\n)/i,

    // University patterns
    /(?:university|college|institute)\s+of\s+([A-Za-z\s]+?)(?:\.|,|\n)/i,

    // "in partnership with" pattern
    /(?:partnership with|collaboration with)\s+([A-Z][A-Za-z\s&]+?)(?:\.|,|\n)/i,
  ];

  for (const pattern of issuerPatterns) {
    const match = ocrText.match(pattern);
    if (match && match[1]) {
      data.issuerName = match[1].trim();
      data.companyName = match[1].trim(); // Set both for consistency
      break;
    }
  }

  // Extract certificate ID - UNIVERSAL patterns for all platforms
  const idPatterns = [
    // Udemy style: UC-xxxxx-xxxxx
    /\b(UC-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\b/i,

    // Coursera style: verify/xxxxx
    /verify\/([A-Z0-9]+)/i,

    // LinkedIn/Microsoft style: alphanumeric
    /(?:certificate|credential|license)\s*(?:id|number|no|#)[:\ s]*([A-Z0-9-]{6,})/i,

    // Generic ID patterns
    /\bID[:\ s]+([A-Z0-9-]{6,})/i,
    /\b([A-Z]{2,}-[0-9]{4,}-[A-Z0-9-]+)\b/,

    // Standalone alphanumeric codes (8+ chars)
    /\b([A-Z0-9]{8,})\b/,
  ];

  for (const pattern of idPatterns) {
    const match = ocrText.match(pattern);
    if (match && match[1] && /[0-9]/.test(match[1])) {
      const id = match[1].trim();
      // Validate: should contain both letters and numbers, or be long enough
      if (id.length >= 6 && (/[A-Z]/i.test(id) || id.length >= 8)) {
        data.certificateId = id;
        break;
      }
    }
  }

  // Extract dates - COMPREHENSIVE patterns for all date formats
  const datePatterns = [
    // ISO format: 2024-12-01
    /(\d{4}-\d{2}-\d{2})/g,

    // Month name formats: December 1, 2024 or Dec 1, 2024
    /(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[,\s]+\d{1,2}[,\s]+\d{4}/gi,

    // Numeric formats: 12/01/2024, 01-12-2024, etc.
    /(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/g,

    // Completion/Issue date with label
    /(?:completion date|issue date|awarded on|date)[:\ s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/gi,
    /(?:completion date|issue date|awarded on|date)[:\ s]+(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/gi,
  ];

  const dates = [];
  for (const pattern of datePatterns) {
    const matches = ocrText.matchAll(pattern);
    for (const match of matches) {
      dates.push(match[0]);
    }
  }

  // Set issue date and completion date
  if (dates.length > 0) {
    data.issueDate = dates[0];
    data.completionDate = dates[dates.length - 1]; // Last date is often completion
  }

  // Extract verification link
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urlMatch = ocrText.match(urlPattern);
  if (urlMatch) {
    data.verificationLink = urlMatch[0];
  }

  // Extract grade/score
  const gradePattern = /(?:grade|score|marks?)[:\s]+([A-Z0-9+\-.]+)/i;
  const gradeMatch = ocrText.match(gradePattern);
  if (gradeMatch) {
    data.grade = gradeMatch[1].trim();
  }

  return data;
}

/**
 * Extract certificate data with LLM and fallback to regex
 * @param {string} ocrText - Raw OCR text
 * @returns {Promise<object>} - Extracted data
 */
export async function extractCertificateData(ocrText) {
  try {
    // Try LLM first
    const llmData = await extractCertificateDataWithLLM(ocrText);

    // If LLM didn't find personName, try regex fallback for personName only
    if (!llmData.personName) {
      console.warn('LLM did not extract personName, trying regex fallback...');
      const regexData = extractCertificateDataWithRegex(ocrText);
      if (regexData.personName) {
        llmData.personName = regexData.personName;
        console.log('✅ Regex fallback found personName:', regexData.personName);
      }
    }

    return { data: llmData, method: 'llm' };
  } catch (error) {
    console.warn('LLM extraction failed, falling back to regex:', error.message);
    // Fallback to regex
    const regexData = extractCertificateDataWithRegex(ocrText);
    return { data: regexData, method: 'regex' };
  }
}
