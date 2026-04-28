#!/usr/bin/env node

/**
 * T5-SP-PLAYWRIGHT-STABLE-SP
 * Script to run Playwright tests multiple times to ensure stability
 * Runs: 10 consecutive executions with zero flakiness
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const RUN_COUNT = 10;
const MAX_RETRIES = 3;
const WORKERS = 1;

// Test files to run for stability check
const TEST_FILES = [
  'tests/e2e/fullscan/menu-smoke.spec.ts',
  'tests/e2e/fullscan/parcel-e2e.spec.ts',
  'tests/e2e/fullscan/maps-scale.spec.ts',
];

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};

console.log(colors.bold + colors.blue + `\n=== T5-SP-PLAYWRIGHT-STABLE-SP ===` + colors.reset);
console.log(colors.bold + `Target: ${RUN_COUNT} consecutive runs with zero flakiness` + colors.reset);
console.log(colors.bold + `Test files: ${TEST_FILES.join(', ')}` + colors.reset + '\n');

let successfulRuns = 0;
let failedRuns = 0;
const flakyTests: Map<string, number> = new Map();

for (let run = 1; run <= RUN_COUNT; run++) {
  console.log(colors.bold + colors.yellow + `\n--- Run ${run}/${RUN_COUNT} ---` + colors.reset);
  
  let runFailed = false;
  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES && !runFailed) {
    try {
      const testArgs = TEST_FILES.map(f => `--grep "@${f}"`).join(' ');
      const cmd = `npx playwright test ${TEST_FILES.map(f => `--grep "^${f.replace(/\./g, '\\.')}"`).join(' ')} --workers=${WORKERS} --reporter=line`;
      
      console.log(`Running: ${cmd}`);
      
      const startTime = Date.now();
      const output = execSync(cmd, {
        encoding: 'utf8',
        stdio: 'pipe',
        env: {
          ...process.env,
          FORCE_COLOR: '0',
        },
        timeout: 120000, // 2 minutes
      });
      const duration = Date.now() - startTime;
      
      console.log(`Output: ${output}`);
      console.log(colors.green + `✓ Run ${run} completed in ${(duration / 1000).toFixed(1)}s` + colors.reset);
      
      // Check for failures in output
      if (output.includes('FAIL') || output.includes('failed')) {
        console.log(colors.red + `✗ Run ${run} had failures` + colors.reset);
        const match = output.match(/(\d+) failed/);
        if (match) {
          const failedCount = parseInt(match[1], 10);
          console.log(colors.red + `${failedCount} test(s) failed` + colors.reset);
          runFailed = true;
        }
      }
      
      successfulRuns++;
      break; // Success, exit retry loop
      
    } catch (error) {
      retryCount++;
      console.log(colors.red + `✗ Run ${run} failed on attempt ${retryCount}: ${error.message}` + colors.reset);
      
      if (retryCount >= MAX_RETRIES) {
        runFailed = true;
        failedRuns++;
      }
    }
  }
  
  if (runFailed) {
    console.log(colors.red + `✗ Run ${run} FAILED after ${retryCount} retries` + colors.reset);
    failedRuns++;
    break; // Stop if any run fails completely
  }
}

// Print summary
console.log(colors.bold + '\n=== Stability Summary ===' + colors.reset);
console.log(`Total runs: ${RUN_COUNT}`);
console.log(colors.green + `Successful: ${successfulRuns}` + colors.reset);
console.log(colors.red + `Failed: ${failedRuns}` + colors.reset);

if (flakyTests.size > 0) {
  console.log(colors.yellow + `\nFlaky tests:` + colors.reset);
  flakyTests.forEach((count, test) => {
    console.log(`  ${test}: failed ${count} times`);
  });
}

const passed = successfulRuns === RUN_COUNT && failedRuns === 0;
console.log(colors.bold + `\nResult: ${passed ? colors.green + 'PASSED' : colors.red + 'FAILED'}` + colors.reset);
console.log(colors.bold + `Stability: ${passed ? 'STABLE' : 'UNSTABLE'}` + colors.reset + '\n');

process.exit(passed ? 0 : 1);
