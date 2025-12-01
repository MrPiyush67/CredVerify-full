import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModelsViaAPI() {
  console.log('Fetching available Gemini models via REST API...');
  console.log('API Key:', GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 10)}...` : 'NOT SET');

  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not set in .env file');
    process.exit(1);
  }

  try {
    // Using the REST API to list models
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;

    console.log('\nFetching from:', url.replace(GEMINI_API_KEY, 'API_KEY'));

    const response = await axios.get(url);
    const models = response.data.models || [];

    console.log('\n' + '='.repeat(80));
    console.log(`FOUND ${models.length} MODELS`);
    console.log('='.repeat(80));

    const generateContentModels = [];

    for (const model of models) {
      console.log('\n' + '-'.repeat(80));
      console.log('Model Name:', model.name);
      console.log('Display Name:', model.displayName);
      console.log('Description:', model.description);
      console.log('Supported Methods:', model.supportedGenerationMethods?.join(', ') || 'N/A');

      if (model.supportedGenerationMethods?.includes('generateContent')) {
        generateContentModels.push(model.name);
        console.log('✅ Supports generateContent');
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('MODELS SUPPORTING generateContent:');
    console.log('='.repeat(80));
    generateContentModels.forEach(m => console.log('✅', m));

    if (generateContentModels.length > 0) {
      console.log('\n🎯 Recommended model to use:', generateContentModels[0]);
      return generateContentModels;
    } else {
      console.log('\n⚠️ No models found that support generateContent');
      return [];
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

listModelsViaAPI().catch(console.error);
