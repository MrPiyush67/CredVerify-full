import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listAvailableModels() {
  console.log('Fetching available Gemini models...');
  console.log('API Key:', GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 10)}...` : 'NOT SET');

  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not set in .env file');
    process.exit(1);
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // List all available models
    console.log('\nFetching models list...\n');
    const models = await genAI.listModels();

    console.log('='.repeat(80));
    console.log('AVAILABLE MODELS');
    console.log('='.repeat(80));

    for await (const model of models) {
      console.log('\n' + '-'.repeat(80));
      console.log('Model Name:', model.name);
      console.log('Display Name:', model.displayName);
      console.log('Description:', model.description);
      console.log('Supported Methods:', model.supportedGenerationMethods);
      console.log('Input Token Limit:', model.inputTokenLimit);
      console.log('Output Token Limit:', model.outputTokenLimit);
    }

    console.log('\n' + '='.repeat(80));
    console.log('Now testing models that support generateContent...\n');

    const testPrompt = 'Say hello!';

    for await (const modelInfo of models) {
      if (modelInfo.supportedGenerationMethods?.includes('generateContent')) {
        console.log(`\nTesting: ${modelInfo.name}`);
        try {
          const model = genAI.getGenerativeModel({ model: modelInfo.name });
          const result = await model.generateContent(testPrompt);
          const response = await result.response;
          const text = response.text();

          console.log(`✅ SUCCESS with ${modelInfo.name}`);
          console.log('Response:', text);
          console.log('\n🎉 WORKING MODEL FOUND:', modelInfo.name);
          return modelInfo.name;
        } catch (error) {
          console.log(`❌ Failed with ${modelInfo.name}:`, error.message);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

listAvailableModels().catch(console.error);
