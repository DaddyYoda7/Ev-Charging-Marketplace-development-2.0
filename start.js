const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('===================================================');
console.log('  ⚡ Launching EV Connect AI Platform ⚡');
console.log('===================================================');

const rootDir = __dirname;
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');

// 1. Start Backend Server (Port 5000)
console.log('1. Starting Backend Server on http://localhost:5000...');
const server = spawn('node', ['index.js'], {
  cwd: serverDir,
  stdio: 'inherit',
  shell: true
});

// 2. Start Frontend Dev Server (Port 5173)
console.log('2. Starting Frontend Client on http://localhost:5173...');
const client = spawn('npm', ['run', 'dev'], {
  cwd: clientDir,
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => {
  console.error('❌ Server startup error:', err);
});

client.on('error', (err) => {
  console.error('❌ Client startup error:', err);
});

process.on('SIGINT', () => {
  console.log('\nStopping EV Connect AI processes...');
  server.kill();
  client.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill();
  client.kill();
  process.exit(0);
});
