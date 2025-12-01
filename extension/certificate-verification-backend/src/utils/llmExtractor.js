import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy initialize Gemini client (only when first used)
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
 * Fallback regex-based extraction when Gemini fails
 */
const extractWithRegex = (ocrText) => {
  console.log('Using comprehensive regex-based extraction...');

  const data = {
    personName: null,
    companyName: null,
    issuerName: null,
    courseName: null,
    programName: null,
    certificateId: null,
    verificationLink: null,
    issueDate: null,
    completionDate: null,
    duration: null,
    skills: [],
    grade: null,
    description: null,
  };

  // Normalize text for better matching
  const normalizedText = ocrText.replace(/\s+/g, ' ').trim();

  // Extract person name - multiple patterns
  const namePatterns = [
    /presented to ([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i,
    /awarded to ([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i,
    /certified ([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i,
    /this certificate is awarded to ([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i,
    /recipient:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i,
    /name:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i,
    /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/, // Fallback: two capitalized words
  ];

  for (const pattern of namePatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      data.personName = match[1].trim();
      break;
    }
  }

  // Extract course/program name - multiple patterns
  const coursePatterns = [
    /for (?:successfully )?(?:completing|participating in|attending|finishing) (?:the )?(.+?)(?:\s+(?:on|from|with|issued|awarded)|\s*$)/i,
    /course:?\s*(.+?)(?:\s+(?:duration|issued|date)|\s*$)/i,
    /program:?\s*(.+?)(?:\s+(?:duration|issued|date)|\s*$)/i,
    /certification (?:in|for) (.+?)(?:\s+(?:issued|awarded)|\s*$)/i,
    /training (?:in|for) (.+?)(?:\s+(?:issued|awarded)|\s*$)/i,
  ];

  for (const pattern of coursePatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1] && match[1].length > 5) { // Avoid short matches
      data.courseName = match[1].trim();
      break;
    }
  }

  // Extract company/organization name
  const companyPatterns = [
    /issued by ([A-Z][a-zA-Z\s&]+?)(?:\s|$|\n|\.)/i,
    /from ([A-Z][a-zA-Z\s&]+?)(?:\s|$|\n|\.)/i,
    /authorized by ([A-Z][a-zA-Z\s&]+?)(?:\s|$|\n|\.)/i,
    /offered (?:by|through) ([A-Z][a-zA-Z\s&]+?)(?:\s|$|\n|\.)/i,
  ];

  for (const pattern of companyPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      data.companyName = match[1].trim();
      break;
    }
  }

  // Known companies fallback
  if (!data.companyName) {
    const knownCompanies = [
      'Coursera',
      'Udemy',
      'Google',
      'Microsoft',
      'IBM',
      'LinkedIn',
      'edX',
      'Udacity',
      'Khan Academy',
      'Codecademy',
    ];
    for (const company of knownCompanies) {
      if (normalizedText.toLowerCase().includes(company.toLowerCase())) {
        data.companyName = company;
        break;
      }
    }
  }

  // Extract issuer name
  const issuerPatterns = [
    /signed by ([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
    /issued by ([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}) (?:CEO|Director|Manager|Head|President)/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*) Certificate/i, // At the beginning
  ];

  for (const pattern of issuerPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      data.issuerName = match[1].trim();
      break;
    }
  }

  // Extract dates
  const datePatterns = [
    /on (\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+\d{4})?)/i,
    /dated (\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+\d{4})?)/i,
    /issued (?:on )?(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+\d{4})?)/i,
    /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}/i,
  ];

  for (const pattern of datePatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      data.issueDate = match[1].trim();
      data.completionDate = match[1].trim();
      break;
    }
  }

  // Extract certificate ID
  const idPatterns = [
    /certificate (?:id|number|no):?\s*([A-Z0-9\-]+)/i,
    /id:?\s*([A-Z0-9\-]+)/i,
    /number:?\s*([A-Z0-9\-]+)/i,
    /registration (?:number|id):?\s*([A-Z0-9\-]+)/i,
  ];

  for (const pattern of idPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      data.certificateId = match[1].trim();
      break;
    }
  }

  // Extract verification link
  const linkMatch = normalizedText.match(/(https?:\/\/[^\s]+)/i);
  if (linkMatch) {
    data.verificationLink = linkMatch[1].replace(/[|)]$/g, '');
  }

  // Extract duration
  const durationMatch = normalizedText.match(/duration:?\s*(\d+\s+(?:hours?|days?|weeks?|months?|years?))/i);
  if (durationMatch) {
    data.duration = durationMatch[1].trim();
  }

  // Generate description
  if (data.courseName && data.companyName) {
    data.description = `Successfully completed ${data.courseName} from ${data.companyName}`;
  } else if (data.courseName && data.issuerName) {
    data.description = `Participated in ${data.courseName} issued by ${data.issuerName}`;
  } else if (data.courseName) {
    data.description = `Completed ${data.courseName}`;
  }

  return data;
};

// ---------- Helper functions (order matters for some runtimes) ----------

const cleanPersonName = (raw) => {
  if (!raw) return null;
  let name = raw.trim();

  // Remove trailing phrases like "for participating", "for completing", etc.
  name = name.replace(/\b(for|who|has|was|is|on|in)\b.*$/i, '').trim();

  // Remove trailing punctuation
  name = name.replace(/[.,;:]+$/g, '').trim();

  // If it's too long, it's probably wrong
  const parts = name.split(/\s+/);
  if (parts.length > 6) {
    return parts.slice(0, 6).join(' ');
  }

  return name || null;
};

const looksLikeCompany = (str) => {
  if (!str) return false;
  const s = str.trim();

  // All caps and 3+ chars (e.g. "BUIRINC")
  if (/^[A-Z0-9]{3,}$/.test(s) && !s.includes(' ')) return true;

  // Ends with typical org suffixes
  if (/\b(inc|ltd|llc|pvt|pvt\.? ltd\.?|corp|corporation|company|technologies|tech|labs|solutions|systems)\.?$/i.test(s)) {
    return true;
  }

  // 1–3 capitalized words → likely org name
  const parts = s.split(' ');
  if (
    parts.length >= 1 &&
    parts.length <= 3 &&
    parts.every((p) => /^[A-Z][a-zA-Z0-9&.\-]*$/.test(p))
  ) {
    return true;
  }

  return false;
};

const isReasonableCertificateId = (id) => {
  if (!id) return false;
  const s = id.trim();

  // Too short → suspicious (e.g. "dharth")
  if (s.length < 6) return false;

  // Most cert IDs contain at least one digit
  if (!/\d/.test(s)) return false;

  // Allow simple alphanumeric with dashes/underscores
  if (!/^[A-Z0-9\-_]+$/i.test(s)) return false;

  return true;
};

const normalizeSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    return skills
      .map((s) => String(s).trim())
      .filter(Boolean);
  }
  return String(skills)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const postProcessExtractedData = (llmData, fallbackData) => {
  const data = { ...(llmData || {}) };

  // --- personName cleanup ---
  if (data.personName) {
    data.personName = cleanPersonName(data.personName);
  }
  if ((!data.personName || data.personName.split(' ').length > 6) && fallbackData?.personName) {
    data.personName = cleanPersonName(fallbackData.personName);
  }

  // --- companyName fix using issuerName or fallback ---
  if (!data.companyName) {
    if (data.issuerName && looksLikeCompany(data.issuerName)) {
      data.companyName = data.issuerName;
    } else if (fallbackData?.companyName) {
      data.companyName = fallbackData.companyName;
    }
  }

  // --- certificateId sanity check ---
  if (data.certificateId && !isReasonableCertificateId(data.certificateId)) {
    if (fallbackData?.certificateId && isReasonableCertificateId(fallbackData.certificateId)) {
      data.certificateId = fallbackData.certificateId;
    } else {
      data.certificateId = null;
    }
  }

  // --- basic date trimming ---
  if (data.issueDate) data.issueDate = String(data.issueDate).trim();
  if (data.completionDate) data.completionDate = String(data.completionDate).trim();

  // --- normalize skills ---
  data.skills = normalizeSkills(data.skills);

  return data;
};

/**
 * Extract structured data from certificate text using Gemini LLM with regex fallback
 */
export const extractCertificateData = async (ocrText) => {
  // First, try regex-based extraction as fallback
  let fallbackData = null;

  try {
    fallbackData = extractWithRegex(ocrText);
  } catch (error) {
    console.error('Regex extraction failed:', error);
  }

  // Try Gemini LLM extraction
  try {
    console.log('Starting Gemini LLM extraction...');

    const geminiModel = getGeminiModel();

    const prompt = `You are an expert at extracting structured information from certificate and internship completion documents.

Given the following OCR-extracted text from a certificate/internship document, extract ALL available information and return it as a valid JSON object.

OCR Text:
"""
${ocrText}
"""

Extract the following information (if available):
- personName: Full name of the certificate recipient (REQUIRED). This must contain ONLY the person's name, no extra words like "for participating", "has completed", "for attending", etc.
- companyName: Name of the issuing company/organization (REQUIRED if clearly visible). If unclear, set to null. Do not invent names.
- issuerName: Name of the person who signed/issued the certificate (CEO, HR, Manager, etc.)
- courseName: Name of the course/program/internship
- programName: Alternative program name if different from course
- certificateId: Certificate ID, registration number, or unique identifier. Do NOT use any part of the person's name. Only extract this if there is a clear ID-like string (alphanumeric and usually contains digits). If unsure, use null.
- verificationLink: Any URL mentioned for verification
- issueDate: Date when certificate was issued (format: YYYY-MM-DD if possible)
- completionDate: Date when course/program was completed (format: YYYY-MM-DD if possible)
- duration: Duration of the course/program
- skills: List of skills mentioned in the certificate
- grade: Grade or performance metric if mentioned
- description: Brief description of what was completed

CRITICAL RULES:
1. Return ONLY a valid JSON object, no additional text or markdown
2. Use null for fields that are not found
3. Extract exact names and dates as they appear
4. For skills, return an array of strings
5. Be precise and do not hallucinate information
6. personName and companyName are REQUIRED - extract them carefully

Example output format:
{
  "personName": "John Doe",
  "companyName": "Coursera",
  "issuerName": "Jane Smith",
  "courseName": "Machine Learning Specialization",
  "programName": null,
  "certificateId": "ABC123XYZ",
  "verificationLink": "https://coursera.org/verify/ABC123XYZ",
  "issueDate": "2023-12-15",
  "completionDate": "2023-12-10",
  "duration": "3 months",
  "skills": ["Machine Learning", "Python", "TensorFlow"],
  "grade": "95%",
  "description": "Successfully completed Machine Learning Specialization"
}

Now extract data from the provided OCR text and return ONLY the JSON object:`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    console.log('Gemini Response:', responseText);

    // Clean the response to extract JSON
    let jsonText = responseText.trim();

    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Try to find JSON object in the response
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    // Parse the JSON response
    const extractedData = JSON.parse(jsonText);

    // Clean / fix LLM output using regex fallback as helper
    const finalData = postProcessExtractedData(extractedData, fallbackData);
    // 🔴 DEBUG: mark this response so we KNOW this version ran
    finalData.__debug = {
      version: 'llm-extractor-v2',
      rawPersonName: extractedData.personName,
    };

    console.log('LLM raw data (inside extractCertificateData):', extractedData);
    console.log('Final cleaned data (inside extractCertificateData):', finalData);

    return finalData;
  } catch (error) {
    console.error('Gemini LLM extraction error:', error.message);

    // Use regex fallback if Gemini fails completely
    if (fallbackData) {
      console.log('✅ Using regex-based extraction as fallback');
      const finalFallback = postProcessExtractedData(fallbackData, fallbackData);
      console.log('Final cleaned fallback data:', finalFallback);
      return finalFallback;
    }

    throw new Error(`LLM extraction failed and no fallback available: ${error.message}`);
  }
};

/**
 * Validate extracted data
 */
export const validateExtractedData = (data) => {
  const errors = [];

  if (!data.personName) {
    errors.push('Person name not found in certificate');
  }

  if (!data.companyName) {
    errors.push('Company name not found in certificate');
  }

  if (data.certificateId && !isReasonableCertificateId(data.certificateId)) {
    errors.push('Certificate ID looks invalid');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
