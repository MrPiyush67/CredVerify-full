// Quick test of the name validation regex

const testName = "Prajjwal Maurya";
const regex = /^[A-Za-z]+(?:\s+[A-Z][a-z]+)+$/;

console.log('Testing:', testName);
console.log('Length:', testName.length);
console.log('Char codes:', [...testName].map(c => c.charCodeAt(0)));
console.log('Regex test:', regex.test(testName));

// Test cleaned version
const cleaned = testName
  .replace(/\b(for|by|to|has|have|successfully|completed?|participating?|awarded?|presented?|this|certifies?|that)\b/gi, '')
  .replace(/\s+/g, ' ')
  .trim();

console.log('\nAfter cleaning:', cleaned);
console.log('Length:', cleaned.length);
console.log('Regex test:', regex.test(cleaned));

// Test variations
console.log('\nTesting variations:');
const variations = [
  'Prajjwal Maurya',
  'Prajjwal Mourya',
  'Siddharth Kumar Gupta',
  'John Smith'
];

variations.forEach(name => {
  console.log(`"${name}":`, regex.test(name) ? '✅ Valid' : '❌ Invalid');
});
