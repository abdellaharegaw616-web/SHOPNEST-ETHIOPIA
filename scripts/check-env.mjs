import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const serverEnv = path.join(rootDir, 'server', '.env');
const clientEnv = path.join(rootDir, 'client', '.env');

console.log('Checking environment files...');

if (!fs.existsSync(serverEnv)) {
  console.log('ℹ️  server/.env not found, generating from server/.env.example...');
  fs.copyFileSync(path.join(rootDir, 'server', '.env.example'), serverEnv);
  console.log('✅ Created server/.env');
}

if (!fs.existsSync(clientEnv)) {
  console.log('ℹ️  client/.env not found, generating from client/.env.example...');
  fs.copyFileSync(path.join(rootDir, 'client', '.env.example'), clientEnv);
  console.log('✅ Created client/.env');
}

console.log('Environment configuration ready.');
