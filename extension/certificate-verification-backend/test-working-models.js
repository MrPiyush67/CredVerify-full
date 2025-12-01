import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Best models to test (free and stable)
const modelsToTest = [
  'models/gemini-2.5-flash',
  'models/gemini-flash-latest',
  'models/gemini-2.0-flash',
  'models/gemini-2.0-flash-lite',
  'models/gemini-flash-lite-latest',
];

const testPrompt = `Extract the following information from this certificate text and return it as JSON:

Certificate Text:
"This is to certify that John Doe has successfully completed the Advanced JavaScript Programming course offered by Tech Academy on December 1, 2023."

Return JSON with these fields:
- personName: The person's name
- courseName: The course name  
- issuerName: The issuing organization
- issueDate: The date

Respond ONLY with valid JSON, no markdown or extra text.`;

async function testModel(modelName) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Testing: ${modelName}`);
  console.log('='.repeat(70));

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });

    console.log('Sending request...');
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ SUCCESS!');
    console.log('Response:', text);

    // Try to parse as JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Valid JSON parsed:');
        console.log(JSON.stringify(parsed, null, 2));
        return { model: modelName, success: true, response: text, parsed };
      }
    } catch (e) {
      console.log('⚠️ Response is not valid JSON, but model works');
    }

    return { model: modelName, success: true, response: text };
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Error:', error.message);
    return { model: modelName, success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🔍 Testing Gemini Models for Certificate Extraction...\n');
  console.log('API Key:', GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 10)}...` : 'NOT SET');

  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not set in .env file');
    process.exit(1);
  }

  const results = [];

  for (const modelName of modelsToTest) {
    const result = await testModel(modelName);
    results.push(result);

    // If we found a working model with valid JSON, we can use it
    if (result.success && result.parsed) {
      console.log(`\n${'🎉'.repeat(35)}`);
      console.log(`✅ PERFECT MODEL FOUND: ${modelName}`);
      console.log('🎉'.repeat(35));
      console.log('\n📝 Update your code to use this model name.\n');
      break;
    }

    // Wait between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  results.forEach(r => {
    const status = r.success ? (r.parsed ? '✅✅' : '✅') : '❌';
    console.log(`${status} ${r.model}`);
  });

  const workingModel = results.find(r => r.success);
  if (workingModel) {
    console.log(`\n✅ RECOMMENDED MODEL: "${workingModel.model}"`);
  } else {
    console.log('\n❌ No working model found.');
  }
}

runTests().catch(console.error);
