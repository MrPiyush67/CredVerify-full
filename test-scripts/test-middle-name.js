import { compareNames } from '../backend/src/features/credential/validation/nameMatcher.service.js';

/**
 * Test the middle name matching fix
 */
async function testMiddleNameMatching() {
  console.log('🧪 Testing Middle Name Matching Fix\n');

  const testCases = [
    {
      legal: 'Prajjwal Mourya',
      cert: 'Prajjwal Mourya',
      expected: 100,
      description: 'Exact match - Prajjwal Mourya'
    },
    {
      legal: 'Prajjwal Kumar Mourya',
      cert: 'Prajjwal Mourya',
      expected: 100,
      description: 'Middle name omitted - Prajjwal Kumar Mourya vs Prajjwal Mourya'
    },
    {
      legal: 'Siddharth Kumar Gupta',
      cert: 'Siddharth Gupta',
      expected: 100,
      description: 'Middle name omitted (Indian name pattern)'
    },
    {
      legal: 'Rahul Sharma',
      cert: 'Rahul Kumar Sharma',
      expected: 100,
      description: 'Middle name added'
    },
    {
      legal: 'Priya Singh',
      cert: 'Priya Singh',
      expected: 100,
      description: 'Exact match'
    },
    {
      legal: 'John Smith',
      cert: 'Jane Smith',
      expected: 0,
      description: 'Different first names (should be strict)'
    },
    {
      legal: 'Arun Kumar Patel',
      cert: 'Arun Patel',
      expected: 100,
      description: 'Middle name omitted (another Indian example)'
    },
    {
      legal: 'Maria Garcia',
      cert: 'Maria Rodriguez Garcia',
      expected: 100,
      description: 'Middle name added (Spanish name pattern)'
    }
  ];

  for (const testCase of testCases) {
    const result = compareNames(testCase.legal, testCase.cert);
    const status = result.confidence === testCase.expected ? '✅' : '❌';

    console.log(`${status} ${testCase.description}`);
    console.log(`   Legal: "${testCase.legal}"`);
    console.log(`   Cert:  "${testCase.cert}"`);
    console.log(`   Result: ${result.confidence}% confidence`);
    console.log(`   Reason: ${result.reason}`);
    console.log(`   Expected: ${testCase.expected}%\n`);
  }
}

// Run the test
testMiddleNameMatching();