import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// List of model names to test
const modelsToTest = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-1.0-pro',
  'gemini-1.0-pro-latest',
  'models/gemini-1.5-flash-latest',
  'models/gemini-1.5-flash',
  'models/gemini-1.5-pro-latest',
  'models/gemini-1.5-pro',
  'models/gemini-pro',
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
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing model: ${modelName}`);
  console.log('='.repeat(60));

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
        console.log('✅ Valid JSON parsed:', parsed);
      }
    } catch (e) {
      console.log('⚠️ Response is not valid JSON, but model works');
    }

    return { model: modelName, success: true, response: text };
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Error details:', error.response);
    }
    return { model: modelName, success: false, error: error.message };
  }
}

async function runTests() {
  console.log('Starting Gemini Model Tests...');
  console.log('API Key:', GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 10)}...` : 'NOT SET');

  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not set in .env file');
    process.exit(1);
  }

  const results = [];

  for (const modelName of modelsToTest) {
    const result = await testModel(modelName);
    results.push(result);

    // If we found a working model, we can stop
    if (result.success) {
      console.log(`\n${'🎉'.repeat(30)}`);
      console.log(`✅ FOUND WORKING MODEL: ${modelName}`);
      console.log('🎉'.repeat(30));
      break;
    }

    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  results.forEach(r => {
    console.log(`${r.success ? '✅' : '❌'} ${r.model}`);
  });

  const workingModel = results.find(r => r.success);
  if (workingModel) {
    console.log(`\n✅ Use this model in your code: "${workingModel.model}"`);
  } else {
    console.log('\n❌ No working model found. Check your API key and quotas.');
  }
}

runTests().catch(console.error);
