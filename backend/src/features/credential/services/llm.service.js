import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let genAI = null;
let geminiModel = null;
let groqClient = null;
let categoriesData = null;

// LLM Configuration
const USE_GROQ_FALLBACK = process.env.USE_GROQ_FALLBACK !== 'false'; // Default to true
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const getGeminiModel = () => {
  if (!geminiModel) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
  }
  return geminiModel;
};

const getGroqClient = () => {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

const loadCategories = () => {
  if (!categoriesData) {
    const categoriesPath = path.join(__dirname, 'categories.json');
    categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
  }
  return categoriesData;
};

/**
 * Extract metadata using Groq (Llama 3.1)
 */
async function extractMetadataWithGroq(ocrText) {
  const groq = getGroqClient();

  const prompt = `You are an information extraction engine.
Your only task is to extract structured certificate metadata from noisy OCR text and output a SINGLE valid JSON object.

🎯 OUTPUT RULES (VERY IMPORTANT)
- Output MUST be **only** a valid JSON object.
- Do NOT wrap JSON in backticks or markdown.
- Do NOT include any explanation, comments, or text before or after the JSON.
- Use double quotes for all keys and string values.
- Do NOT include trailing commas.
- If a field is unknown or not confidently present, set it to null (or [] for arrays), NOT an empty string and NOT a guess.

🎯 TARGET JSON SHAPE
Return exactly this shape:

{
  "recipientName": "string or null",
  "courseTitle": "string or null",
  "duration": "string or null",
  "learningHours": number or null,
  "grade": "string or null",
  "NSQFLevel": number or null,
  "issueDate": "YYYY-MM-DD or null",
  "completionDate": "YYYY-MM-DD or null",
  "skills": ["string", ...] or [],
  "description": "string or null",
  "certificateUrl": "string or null"
}

Do not add any extra fields.

────────────────────────────────────────
🧍‍♂️ FIELD EXTRACTION RULES
────────────────────────────────────────

1️⃣ recipientName (MOST IMPORTANT)
- This is the name of the person who RECEIVED the certificate.
- NEVER leave this null if you can reasonably infer it from the text.
- Look for patterns near phrases like "This is to certify that", "awarded to", etc.
- DO NOT use instructor names or organization names.

2️⃣ courseTitle
- The name of the course, program, or training.
- Often near "Certificate of", "completed", "in recognition of".

3️⃣ duration
- Time period of the course (e.g., "3 months", "66 hours", "10 weeks").

4️⃣ learningHours
- Extract numeric hours if mentioned (e.g., "66 total hours" → 66).

5️⃣ grade
- Letter grade, percentage, or qualitative result (e.g., "A+", "95%", "Distinction").

6️⃣ NSQFLevel
- NSQF level if mentioned (1-10).

7️⃣ issueDate and completionDate
- Parse dates to YYYY-MM-DD format.

8️⃣ skills
- Array of specific skills mentioned.

9️⃣ description
- Brief summary of what the certificate is for.

🔟 certificateUrl
- URL for verification if present.

────────────────────────────────────────
📥 OCR INPUT
────────────────────────────────────────

Now extract the metadata from the following OCR text and return ONLY the JSON object as specified:

${ocrText}`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: GROQ_MODEL,
    temperature: 0.1,
    max_tokens: 1000,
  });

  const text = completion.choices[0].message.content.trim()
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  console.log(`🤖 [GROQ-LLM] Raw response:`, text.substring(0, 500));
  return JSON.parse(text);
}

export async function extractCertificateMetadata(ocrText) {
  // Try Gemini first
  try {
    const geminiModel = getGeminiModel();
    const prompt = `You are an information extraction engine. 
Your only task is to extract structured certificate metadata from noisy OCR text and output a SINGLE valid JSON object.

🎯 OUTPUT RULES (VERY IMPORTANT)
- Output MUST be **only** a valid JSON object.
- Do NOT wrap JSON in backticks or markdown.
- Do NOT include any explanation, comments, or text before or after the JSON.
- Use double quotes for all keys and string values.
- Do NOT include trailing commas.
- If a field is unknown or not confidently present, set it to null (or [] for arrays), NOT an empty string and NOT a guess.

🎯 TARGET JSON SHAPE
Return exactly this shape:

{
  "recipientName": "string or null",
  "courseTitle": "string or null",
  "duration": "string or null",
  "learningHours": number or null,
  "grade": "string or null",
  "NSQFLevel": number or null,
  "issueDate": "YYYY-MM-DD or null",
  "completionDate": "YYYY-MM-DD or null",
  "skills": ["string", ...] or [],
  "description": "string or null",
  "certificateUrl": "string or null"
}

Do not add any extra fields.

────────────────────────────────────────
🧍‍♂️ FIELD EXTRACTION RULES
────────────────────────────────────────

1️⃣ recipientName (MOST IMPORTANT)
- This is the name of the person who RECEIVED the certificate.
- NEVER leave this null if you can reasonably infer it from the text.
- Look for patterns near phrases like:
  - "This is to certify that"
  - "This certificate is awarded to"
  - "Awarded to"
  - "Presented to"
  - "Certificate of Completion" → next prominent name
  - "has successfully completed" (name usually comes before this)
- The recipient name is usually:
  - A standalone proper name (one or more capitalized words)
  - Positioned between the certificate title and course/program details
- DO NOT use:
  - Names labeled with "Instructor", "Teacher", "Trainer", "Mentor", "Assessor"
  - Names near "Issued by", "Authorized signatory", "Director", "CEO", "Chairman", etc.
  - Organization names like "Coursera", "Udemy", "National Skill Development Corporation"
- If multiple names appear:
  - Prefer the one that appears *once* near phrases like "certify that", "awarded to"
  - Ignore signatures and titles like "Course Instructor", "Program Director"
  - SPECIAL CASE: If you see a line that contains "Instructor" or "Instructors" followed by one or more names,
  and the very next non-empty line is just a single name (with no role like Instructor/Teacher/etc),
  that next line is usually the recipient name. Example (Udemy-style OCR):

  Instructors Dr. Angela Yu
  Prajjwal Maurya
  Date Aug. 8, 2023

  → Here "Dr. Angela Yu" is the instructor, "Prajjwal Maurya" is the recipientName.


2️⃣ courseTitle
- Look for:
  - Text near "Course:", "Program:", "for completing", "in the course of"
  - Headlines like "Certificate in ___", "Diploma in ___", "CERTIFICATE OF ___"
- Prefer the most specific phrase that describes WHAT was studied, not "Certificate of Completion".
- Examples:
  - "Full-Stack Web Development"
  - "Data Analytics with Python"
- If unclear, use null.

3️⃣ duration
- Free-text duration string.
- Look for:
  - "Duration:", "Course duration", "for a period of", "over ___ weeks/months/hours"
- Keep the original textual form when possible:
  - e.g. "6 weeks", "40 hours", "3 month program"
- If not mentioned, set to null.

4️⃣ learningHours
- Numeric total of learning hours, if explicit.
- Look for patterns:
  - "X hours", "X learning hours", "X contact hours"
  - Example: from "Total Duration: 40 Hours" → learningHours = 40
- Must be a number, not a string.
- If multiple hour-like numbers appear, choose the one explicitly tied to course duration.
- Use null if not clearly specified.

5️⃣ grade
- Any grade, score, or classification.
- Examples:
  - "A", "A+", "Distinction", "First Class", "Pass", "Score: 87%"
- Look near:
  - "Grade:", "Result:", "Score:", "Marks obtained:"
- If not present, null.

6️⃣ NSQFLevel
- NSQF = National Skills Qualifications Framework (levels 1–10).
- Look for strings like:
  - "NSQF Level 4", "NSQF Level-5", "NSQF level: 6"
- Extract only the numeric level (1–10).
- If not mentioned, null.

7️⃣ issueDate and completionDate
- Normalize ALL dates to "YYYY-MM-DD".
- Common input formats:
  - "01/02/2023", "1-2-2023", "01 Feb 2023", "February 1, 2023"
- If day or month is missing or ambiguous:
  - If you cannot confidently infer full date, set to null.
- issueDate:
  - Look for "Date of issue", "Date of certification", "Issued on"
- completionDate:
  - Look for "Date of completion", "Completed on", "has successfully completed on"
- If only one date is clearly present:
  - Put it in issueDate if it looks like an issuing date
  - Put it in completionDate if it is clearly a completion date
  - Otherwise, use null for the second field.

8️⃣ skills
- Extract a list of distinct skills if they appear.
- Look for:
  - Sections like "Skills:", "Skills gained", "Key skills", "Learning outcomes", bullet lists.
  - Examples: "JavaScript", "React", "Data Analysis", "Machine Learning"
- Return as an array of strings.
- If no clear skills section, use [] (empty array), NOT null.

9️⃣ description
- One or two sentences summarizing:
  - What the certificate represents
  - Course focus and nature (e.g., "online self-paced course", "NSDC-approved training program", etc.)
- Prefer reusing phrases present in the OCR text, lightly cleaned.
- If the text is extremely short or unclear, null is acceptable.

🔟 certificateUrl
- Look for any URL or verification link printed on the certificate:
  - e.g., "Verify at https://coursera.org/verify/ABC123"
  - e.g., short links like "bit.ly/xyz", "udemy.com/certificate/UC-XXXXXX"
- If multiple URLs exist:
  - Prefer verification/validation-related ones:
    - containing "verify", "certificate", "cert", "cred", "validation"
  - Otherwise, choose the one closest to certificate-related text.
- If no URL-like pattern found, null.

────────────────────────────────────────
📌 EXAMPLES (FOLLOW THIS STYLE EXACTLY)
────────────────────────────────────────

Example 1
OCR:
"Certificate of Completion
This is to certify that JOHN DOE has successfully completed the course
'Full-Stack Web Development' of 40 hours duration on 12 March 2023.
Verification: https://example.org/verify/ABC123"

Expected JSON:
{
  "recipientName": "JOHN DOE",
  "courseTitle": "Full-Stack Web Development",
  "duration": "40 hours",
  "learningHours": 40,
  "grade": null,
  "NSQFLevel": null,
  "issueDate": "2023-03-12",
  "completionDate": "2023-03-12",
  "skills": [],
  "description": "Certificate of completion for the Full-Stack Web Development course.",
  "certificateUrl": "https://example.org/verify/ABC123"
}

Example 2
OCR:
"NSDC Approved Training
This is to certify that Priya Sharma has successfully completed
'Customer Care Executive' training program.
Duration: 3 months (NSQF Level 4)
Date of issue: 01/08/2022"

Expected JSON:
{
  "recipientName": "Priya Sharma",
  "courseTitle": "Customer Care Executive",
  "duration": "3 months",
  "learningHours": null,
  "grade": null,
  "NSQFLevel": 4,
  "issueDate": "2022-08-01",
  "completionDate": null,
  "skills": [],
  "description": "NSDC-approved Customer Care Executive training program certificate.",
  "certificateUrl": null
}

Example 3
OCR:
"~ Certificate no: UC-858¢158b-6121-47ab-912f-b5480832d8a
U d e m Certificate url: ude.my/UC-858c158b-6121-47ab-912f-b5480832d8a
Reference Number: 0004
CERTIFICATE OF COMPLETION
Instructors Dr. Angela Yu
Prajjwal Maurya
Date Aug. 8,2023
Length 66 total hours"

Expected JSON:
{
  "recipientName": "Prajjwal Maurya",
  "courseTitle": null,
  "duration": "66 total hours",
  "learningHours": 66,
  "grade": null,
  "NSQFLevel": null,
  "issueDate": "2023-08-08",
  "completionDate": null,
  "skills": [],
  "description": "Certificate of Completion.",
  "certificateUrl": "ude.my/UC-858c158b-6121-47ab-912f-b5480832d8a"
}

────────────────────────────────────────
📥 OCR INPUT
────────────────────────────────────────

Now extract the metadata from the following OCR text and return ONLY the JSON object as specified:

${ocrText}
`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Log the raw LLM response for debugging
    console.log(`🤖 [GEMINI-LLM] Raw response:`, text.substring(0, 500));
    console.log(`✅ [GEMINI-LLM] Metadata extraction successful`);

    return JSON.parse(text);
  } catch (error) {
    console.warn(`⚠️  [GEMINI-LLM] Failed:`, error.message);

    // Check if it's a quota/rate limit error and Groq fallback is enabled
    const isQuotaError = error.message.includes('quota') ||
                        error.message.includes('429') ||
                        error.message.includes('rate limit');

    if (USE_GROQ_FALLBACK && isQuotaError && process.env.GROQ_API_KEY) {
      console.log(`🔄 [LLM-SERVICE] Falling back to Groq (Llama 3.1)...`);
      try {
        const result = await extractMetadataWithGroq(ocrText);
        console.log(`✅ [GROQ-LLM] Metadata extraction successful (fallback)`);
        return result;
      } catch (groqError) {
        console.error(`❌ [GROQ-LLM] Fallback failed:`, groqError.message);
        throw new Error(`All LLM providers failed. Gemini: ${error.message}, Groq: ${groqError.message}`);
      }
    }

    throw new Error(`LLM failed: ${error.message}`);
  }
}

/**
 * Categorize course using Groq LLM (fallback)
 * @param {Object} courseData - Scraped course data
 * @returns {Promise<Object>} - { category, confidence, reasoning }
 */
async function categorizeCourseWithGroq(courseData) {
  const groq = getGroqClient();
  const categories = loadCategories();

  const categoriesList = categories.categories.join(', ');

  const prompt = `You are a course categorization expert for NCrF (National Credit Framework) in India.

Analyze this course and assign it to ONE sector from this list:
${categoriesList}

Course:
- Title: ${courseData.title || 'Unknown'}
- Description: ${courseData.description || 'N/A'}
- What You'll Learn: ${courseData.what_you_will_learn?.join(', ') || 'N/A'}
- Skill Level: ${courseData.skill_level || 'N/A'}

Output ONLY valid JSON:
{
  "category": "IT/ITeS",
  "confidence": 0.95,
  "reasoning": "Course teaches programming and web development."
}

The category MUST be from the list above (exact match). Output ONLY JSON, no markdown.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: GROQ_MODEL,
    temperature: 0.1,
    max_tokens: 500,
  });

  const text = completion.choices[0].message.content.trim()
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  console.log(`🎯 [GROQ-CATEGORIZATION] Raw response:`, text.substring(0, 200));

  const parsed = JSON.parse(text);

  // Validate category is in list
  if (!categories.categories.includes(parsed.category)) {
    console.warn(`⚠️  [GROQ-CATEGORIZATION] Invalid category returned: ${parsed.category}`);

    // Try to find closest match
    const closestMatch = categories.categories.find(c =>
      c.toLowerCase().includes(parsed.category.toLowerCase()) ||
      parsed.category.toLowerCase().includes(c.toLowerCase())
    );

    if (closestMatch) {
      console.log(`✅ [GROQ-CATEGORIZATION] Mapped to closest match: ${closestMatch}`);
      parsed.category = closestMatch;
    } else {
      console.warn(`⚠️  [GROQ-CATEGORIZATION] No close match found, using default`);
      parsed.category = 'Education Training & Research';
      parsed.confidence = 0.3;
      parsed.reasoning = 'Category could not be determined accurately; defaulted to Education Training & Research';
    }
  }

  return parsed;
}

/**
 * Categorize course into NCrF sector
 * @param {Object} courseData - Scraped course data
 * @returns {Promise<Object>} - { category, confidence, reasoning }
 */
export async function categorizeCourse(courseData) {
  // Try Gemini first
  try {
    const geminiModel = getGeminiModel();
    const categories = loadCategories();

    const categoriesList = categories.categories.join(', ');

    const prompt = `You are a course categorization expert for the National Credit Framework (NCrF) in India.

Your task is to analyze a course and assign it to ONE of the following ${categories.categories.length} NCrF sectors:

${categoriesList}

Course Information:
- Title: ${courseData.title || 'Unknown'}
- Description: ${courseData.description || 'N/A'}
- What You'll Learn: ${courseData.what_you_will_learn?.join(', ') || 'N/A'}
- Skill Level: ${courseData.skill_level || 'N/A'}
- Instructor: ${courseData.instructor || 'N/A'}

INSTRUCTIONS:
1. Read the course information carefully
2. Select the MOST appropriate NCrF sector from the list above
3. Provide your confidence level (0.0 to 1.0)
4. Explain your reasoning in 1-2 sentences

OUTPUT FORMAT (valid JSON only):
{
  "category": "IT/ITeS",
  "confidence": 0.95,
  "reasoning": "Course teaches web development and programming, which clearly falls under Information Technology / IT-enabled Services."
}

IMPORTANT:
- The category MUST be one of the ${categories.categories.length} categories listed above (exact match, including capitalization and punctuation)
- Output ONLY the JSON object, no additional text
- Do NOT wrap JSON in backticks or markdown

Now categorize this course. Output ONLY the JSON object:`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    console.log(`🎯 [GEMINI-CATEGORIZATION] Raw response:`, text.substring(0, 200));

    const parsed = JSON.parse(text);

    // Validate category is in list
    if (!categories.categories.includes(parsed.category)) {
      console.warn(`⚠️  [GEMINI-CATEGORIZATION] Invalid category returned: ${parsed.category}`);

      // Try to find closest match
      const closestMatch = categories.categories.find(c =>
        c.toLowerCase().includes(parsed.category.toLowerCase()) ||
        parsed.category.toLowerCase().includes(c.toLowerCase())
      );

      if (closestMatch) {
        console.log(`✅ [GEMINI-CATEGORIZATION] Mapped to closest match: ${closestMatch}`);
        parsed.category = closestMatch;
      } else {
        console.warn(`⚠️  [GEMINI-CATEGORIZATION] No close match found, using default`);
        parsed.category = 'Education Training & Research'; // Default fallback
        parsed.confidence = 0.3;
        parsed.reasoning = 'Category could not be determined accurately; defaulted to Education Training & Research';
      }
    }

    console.log(`✅ [GEMINI-CATEGORIZATION] Category: ${parsed.category} (${(parsed.confidence * 100).toFixed(0)}%)`);

    return parsed;

  } catch (error) {
    console.warn(`⚠️  [GEMINI-CATEGORIZATION] Failed:`, error.message);

    // Check if it's a quota/rate limit error and Groq fallback is enabled
    const isQuotaError = error.message.includes('quota') ||
                        error.message.includes('429') ||
                        error.message.includes('rate limit');

    if (USE_GROQ_FALLBACK && isQuotaError && process.env.GROQ_API_KEY) {
      console.log(`🔄 [LLM-CATEGORIZATION] Falling back to Groq (Llama 3.1)...`);
      try {
        const result = await categorizeCourseWithGroq(courseData);
        console.log(`✅ [GROQ-CATEGORIZATION] Category: ${result.category} (${(result.confidence * 100).toFixed(0)}%) (fallback)`);
        return result;
      } catch (groqError) {
        console.error(`❌ [GROQ-CATEGORIZATION] Fallback failed:`, groqError.message);
        throw new Error(`All LLM providers failed. Gemini: ${error.message}, Groq: ${groqError.message}`);
      }
    }

    throw new Error(`Course categorization failed: ${error.message}`);
  }
}
