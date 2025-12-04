#!/usr/bin/env node

/**
 * Platform Manager Utility
 * Helps manage platforms.json - add, remove, list platforms
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLATFORMS_FILE = path.join(__dirname, '..', 'extension', 'platforms.json');

// Load platforms
function loadPlatforms() {
  const data = fs.readFileSync(PLATFORMS_FILE, 'utf8');
  return JSON.parse(data);
}

// Save platforms
function savePlatforms(data) {
  fs.writeFileSync(PLATFORMS_FILE, JSON.stringify(data, null, 2) + '\n');
}

// Add a new platform
function addPlatform(id, name, category, domains) {
  const data = loadPlatforms();

  // Check if ID already exists
  if (data.platforms.find(p => p.id === id)) {
    console.error(`❌ Platform with ID "${id}" already exists!`);
    process.exit(1);
  }

  const newPlatform = {
    id,
    name,
    category,
    domains: Array.isArray(domains) ? domains : [domains]
  };

  data.platforms.push(newPlatform);
  savePlatforms(data);

  console.log(`✅ Added platform: ${name}`);
  console.log(`   ID: ${id}`);
  console.log(`   Category: ${category}`);
  console.log(`   Domains: ${newPlatform.domains.join(', ')}`);
}

// List all platforms
function listPlatforms() {
  const data = loadPlatforms();

  console.log(`\n📋 Total Platforms: ${data.platforms.length}`);
  console.log(`🌐 Total Domains: ${data.platforms.reduce((sum, p) => sum + p.domains.length, 0)}\n`);

  // Group by category
  const byCategory = {};
  data.platforms.forEach(p => {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  });

  Object.entries(byCategory).forEach(([category, platforms]) => {
    console.log(`\n📁 ${category.toUpperCase().replace(/_/g, ' ')} (${platforms.length})`);
    platforms.forEach(p => {
      console.log(`   • ${p.name} (${p.domains.length} domain${p.domains.length > 1 ? 's' : ''})`);
    });
  });
}

// Search platforms by domain
function searchByDomain(searchDomain) {
  const data = loadPlatforms();
  const results = data.platforms.filter(p =>
    p.domains.some(d => d.toLowerCase().includes(searchDomain.toLowerCase()))
  );

  if (results.length === 0) {
    console.log(`❌ No platforms found matching domain: ${searchDomain}`);
  } else {
    console.log(`\n🔍 Found ${results.length} platform(s) matching "${searchDomain}":\n`);
    results.forEach(p => {
      console.log(`   • ${p.name} (${p.id})`);
      console.log(`     Category: ${p.category}`);
      console.log(`     Domains: ${p.domains.join(', ')}`);
      console.log('');
    });
  }
}

// Remove a platform
function removePlatform(id) {
  const data = loadPlatforms();
  const index = data.platforms.findIndex(p => p.id === id);

  if (index === -1) {
    console.error(`❌ Platform with ID "${id}" not found!`);
    process.exit(1);
  }

  const removed = data.platforms[index];
  data.platforms.splice(index, 1);
  savePlatforms(data);

  console.log(`✅ Removed platform: ${removed.name} (${removed.id})`);
}

// Show statistics
function showStats() {
  const data = loadPlatforms();
  const totalDomains = data.platforms.reduce((sum, p) => sum + p.domains.length, 0);

  console.log('\n📊 Platform Statistics\n');
  console.log(`Total Platforms: ${data.platforms.length}`);
  console.log(`Total Domains: ${totalDomains}`);
  console.log(`Avg Domains/Platform: ${(totalDomains / data.platforms.length).toFixed(1)}`);

  // Category breakdown
  const categories = {};
  data.platforms.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + 1;
  });

  console.log('\nBy Category:');
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`  ${cat.padEnd(25)} ${count} platform${count > 1 ? 's' : ''}`);
    });
}

// CLI Interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'add':
    if (args.length < 5) {
      console.error('Usage: node platforms-manager.js add <id> <name> <category> <domain1> [domain2] [domain3]...');
      console.error('Example: node platforms-manager.js add khan_academy "Khan Academy" mooc khanacademy.org www.khanacademy.org');
      process.exit(1);
    }
    addPlatform(args[1], args[2], args[3], args.slice(4));
    break;

  case 'list':
    listPlatforms();
    break;

  case 'search':
    if (args.length < 2) {
      console.error('Usage: node platforms-manager.js search <domain>');
      process.exit(1);
    }
    searchByDomain(args[1]);
    break;

  case 'remove':
    if (args.length < 2) {
      console.error('Usage: node platforms-manager.js remove <id>');
      process.exit(1);
    }
    removePlatform(args[1]);
    break;

  case 'stats':
    showStats();
    break;

  default:
    console.log(`
CredVerify Platform Manager

Usage:
  node platforms-manager.js <command> [options]

Commands:
  list                     List all platforms grouped by category
  add <id> <name> <cat> <domains...>   Add a new platform
  remove <id>             Remove a platform by ID
  search <domain>         Search for platforms by domain
  stats                   Show platform statistics

Examples:
  node platforms-manager.js list
  node platforms-manager.js add khan_academy "Khan Academy" mooc khanacademy.org
  node platforms-manager.js search coursera
  node platforms-manager.js remove khan_academy
  node platforms-manager.js stats

Categories:
  mooc, indian_government, cloud_vendor, vendor_certification,
  coding_platform, badge_wallet, wallet_storage, ncvet_ecosystem,
  developer_profile
`);
}
