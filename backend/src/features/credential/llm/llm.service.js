import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;

const getGeminiModel = () => {
  if (!model) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
  }
  return model;
};

export async function extractCertificateMetadata(ocrText) {
  try {
    const geminiModel = getGeminiModel();
    const prompt = `Extract certificate metadata from the following OCR text. Return ONLY a valid JSON object with these fields:
{
  "recipientName": "string - REQUIRED - full name of the person who received this certificate (awarded to/presented to/issued to)",
  "courseTitle": "string - name of the course/program/certificate",
  "duration": "string - course duration (e.g., '6 weeks', '40 hours')",
  "learningHours": "number - total learning hours as a number",
  "grade": "string - grade or score if mentioned",
  "NSQFLevel": "number - NSQF level (1-10) if mentioned",
  "issueDate": "string - issue date in YYYY-MM-DD format",
  "completionDate": "string - completion date in YYYY-MM-DD format",
  "skills": ["array", "of", "skills"],
  "description": "string - brief description",
  "certificateUrl": "string - verification URL/link if present on certificate (e.g., coursera.org/verify/ABC123)"
}

CRITICAL: Extract the recipient's name EXACTLY as it appears on the certificate. Look for phrases like "awarded to", "presented to", "certifies that", "this is to certify that", etc.
IMPORTANT: Also look for any URLs or verification links printed on the certificate itself.

OCR Text:
${ocrText}`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`LLM failed: ${error.message}`);
  }
}
