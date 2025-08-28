#!/usr/bin/env node

const { spawn } = require('child_process');

// Start the Next.js production server
const server = spawn('npx', ['next', 'start'], {
  stdio: ['inherit', 'pipe', 'pipe']
});

// Listen for server output
server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  // Check if server is ready (Next.js outputs "Ready on" or similar)
  if (output.includes('Local:') || output.includes('ready') || output.includes('listen') || output.includes('Ready on')) {
    console.log('Server is ready!');
  }
});

server.stderr.on('data', (data) => {
  console.error(data.toString());
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle process signals
process.on('SIGINT', () => {
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
});