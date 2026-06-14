#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Run Playwright tests
const testProcess = spawn('npx', ['playwright', 'test'], {
  stdio: 'inherit',
  shell: true,
});

testProcess.on('close', (code) => {
  process.exit(code);
});

testProcess.on('error', (err) => {
  console.error('Failed to start test process:', err);
  process.exit(1);
});
