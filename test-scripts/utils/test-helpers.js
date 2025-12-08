/**
 * Test Utilities and Helpers
 * Shared functions for test scripts
 */

export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

/**
 * Colored console logging
 */
export function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Assertion helpers
 */
export const assert = {
  equal: (actual, expected, message = '') => {
    if (actual !== expected) {
      throw new Error(`Assertion failed: ${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
  },

  notEqual: (actual, expected, message = '') => {
    if (actual === expected) {
      throw new Error(`Assertion failed: ${message}\nExpected not equal to: ${expected}`);
    }
  },

  assertTrue: (value, message = '') => {
    if (!value) {
      throw new Error(`Assertion failed: ${message}\nExpected truthy value, got: ${value}`);
    }
  },

  assertFalse: (value, message = '') => {
    if (value) {
      throw new Error(`Assertion failed: ${message}\nExpected falsy value, got: ${value}`);
    }
  },

  contains: (haystack, needle, message = '') => {
    if (!haystack.includes(needle)) {
      throw new Error(`Assertion failed: ${message}\nExpected to contain: ${needle}`);
    }
  },

  greaterThan: (actual, expected, message = '') => {
    if (actual <= expected) {
      throw new Error(`Assertion failed: ${message}\nExpected > ${expected}, got: ${actual}`);
    }
  }
};

/**
 * Test result tracking
 */
export class TestRunner {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(description, fn) {
    this.tests.push({ description, fn });
  }

  async run() {
    log(`\n🧪 ${this.name}`, 'bright');
    log('='.repeat(60), 'cyan');

    for (const test of this.tests) {
      try {
        await test.fn();
        log(`  ✅ ${test.description}`, 'green');
        this.passed++;
      } catch (error) {
        log(`  ❌ ${test.description}`, 'red');
        log(`     Error: ${error.message}`, 'red');
        this.failed++;
      }
    }

    log('\n' + '-'.repeat(60), 'cyan');
    log(`Passed: ${this.passed} | Failed: ${this.failed}`, this.failed === 0 ? 'green' : 'yellow');

    if (this.failed === 0) {
      log('✅ All tests passed!', 'green');
    } else {
      log(`⚠️  ${this.failed} test(s) failed`, 'red');
    }

    return this.failed === 0;
  }
}

/**
 * Wait utility
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry utility
 */
export async function retry(fn, maxAttempts = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      log(`  ⚠️  Attempt ${attempt} failed, retrying...`, 'yellow');
      await sleep(delayMs);
    }
  }
}

/**
 * HTTP helpers
 */
export async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

/**
 * Generate test data
 */
export function generateTestUser(role = 'learner') {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@credverify.test`,
    password: 'Test@123456',
    name: `Test User ${timestamp}`,
    role
  };
}

/**
 * Format bytes
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Format duration
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

/**
 * Table formatting
 */
export function printTable(data) {
  if (data.length === 0) return;

  const keys = Object.keys(data[0]);
  const widths = {};

  keys.forEach(key => {
    widths[key] = Math.max(
      key.length,
      ...data.map(row => String(row[key]).length)
    );
  });

  // Header
  const header = keys.map(key => key.padEnd(widths[key])).join(' | ');
  console.log(header);
  console.log(keys.map(key => '-'.repeat(widths[key])).join('-+-'));

  // Rows
  data.forEach(row => {
    const line = keys.map(key => String(row[key]).padEnd(widths[key])).join(' | ');
    console.log(line);
  });
}

export default {
  colors,
  log,
  assert,
  TestRunner,
  sleep,
  retry,
  fetchJSON,
  generateTestUser,
  formatBytes,
  formatDuration,
  printTable
};
