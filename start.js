const { spawn, spawnSync, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('===================================================');
console.log('  ⚡ Launching EV Connect AI Full-Stack Platform ⚡');
console.log('===================================================');

const rootDir = __dirname;
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');

// 1. Auto-install server dependencies if missing
const serverModules = path.join(serverDir, 'node_modules');
if (!fs.existsSync(serverModules)) {
  console.log('\n[INFO] Installing server dependencies (express, sqlite3, cors)...');
  try {
    execSync('npm install', { cwd: serverDir, stdio: 'inherit' });
    console.log('✔ Server dependencies installed.\n');
  } catch (err) {
    console.error('❌ Failed to install server dependencies:', err.message);
  }
}

// 2. Auto-install client dependencies if missing
const clientModules = path.join(clientDir, 'node_modules');
if (!fs.existsSync(clientModules)) {
  console.log('\n[INFO] Installing client dependencies (vite, react, leaflet, lucide-react)...');
  try {
    execSync('npm install', { cwd: clientDir, stdio: 'inherit' });
    console.log('✔ Client dependencies installed.\n');
  } catch (err) {
    console.error('❌ Failed to install client dependencies:', err.message);
  }
}

// 3. Start Backend Server (Port 5000)
console.log('\n1. Starting Backend API Server (Port 5000)...');
const server = spawn('node', ['index.js'], {
  cwd: serverDir,
  stdio: 'inherit',
  shell: true
});

// 4. Start Frontend Dev Server (Port 5173)
console.log('2. Starting Frontend Client (Port 5173)...');
const client = spawn('npm', ['run', 'dev'], {
  cwd: clientDir,
  stdio: 'inherit',
  shell: true
});

console.log('\n===================================================');
console.log('  ⚡ EV Connect AI is active!');
console.log('  Frontend: http://localhost:5173');
console.log('  Backend:  http://localhost:5000');
console.log('===================================================\n');

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
