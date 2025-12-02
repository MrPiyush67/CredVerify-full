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
  "courseTitle": "string - name of the course/program/certificate",
  "duration": "string - course duration (e.g., '6 weeks', '40 hours')",
  "learningHours": "number - total learning hours as a number",
  "grade": "string - grade or score if mentioned",
  "NSQFLevel": "number - NSQF level (1-10) if mentioned",
  "issueDate": "string - issue date in YYYY-MM-DD format",
  "completionDate": "string - completion date in YYYY-MM-DD format",
  "skills": ["array", "of", "skills"],
  "description": "string - brief description"
}

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
