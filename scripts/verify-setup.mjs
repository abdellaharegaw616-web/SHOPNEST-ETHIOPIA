import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const requiredPaths = [
  // Root files
  '.gitignore',
  '.env.example',
  'package.json',
  'tsconfig.base.json',
  'README.md',

  // Shared package
  'shared/package.json',
  'shared/tsconfig.json',
  'shared/src/index.ts',
  'shared/src/constants/brand.constants.ts',
  'shared/src/types/api.types.ts',
  'shared/src/types/brand.types.ts',

  // Server package
  'server/package.json',
  'server/tsconfig.json',
  'server/vitest.config.ts',
  'server/.env.example',
  'server/src/index.ts',
  'server/src/app.ts',
  'server/src/config/env.ts',
  'server/src/config/database.ts',
  'server/src/controllers/health.controller.ts',
  'server/src/routes/index.ts',
  'server/src/routes/health.routes.ts',
  'server/src/middleware/errorHandler.ts',
  'server/src/middleware/requestLogger.ts',
  'server/src/utils/logger.ts',
  'server/src/models',
  'server/src/services',
  'server/src/validators',
  'server/test/health.test.ts',

  // Client package
  'client/package.json',
  'client/tsconfig.json',
  'client/vite.config.ts',
  'client/tailwind.config.js',
  'client/postcss.config.js',
  'client/vitest.config.ts',
  'client/playwright.config.ts',
  'client/.env.example',
  'client/index.html',
  'client/src/main.tsx',
  'client/src/App.tsx',
  'client/src/index.css',
  'client/src/config/env.ts',
  'client/src/store/index.ts',
  'client/src/store/api/apiSlice.ts',
  'client/src/store/api/healthApi.ts',
  'client/src/i18n/config.ts',
  'client/src/i18n/locales/en.json',
  'client/src/i18n/locales/am.json',
  'client/src/components/layout/Header.tsx',
  'client/src/components/layout/Footer.tsx',
  'client/src/components/common/Button.tsx',
  'client/src/components/common/Card.tsx',
  'client/src/components/common/LanguageSelector.tsx',
  'client/src/pages/HomePage.tsx',
  'client/src/pages/NotFoundPage.tsx',
  'client/test/setup.ts',
  'client/test/App.test.tsx',

  // Docs
  'docs/ARCHITECTURE.md',
  'docs/API.md',
  'docs/ENVIRONMENT.md',
];

console.log('====================================================');
console.log('🔍 ShopNest Ethiopia — Architecture & Setup Verification');
console.log('====================================================\n');

let missingCount = 0;

for (const relPath of requiredPaths) {
  const fullPath = path.join(rootDir, relPath);
  if (fs.existsSync(fullPath)) {
    console.log(`  [OK] ${relPath}`);
  } else {
    console.error(`  [MISSING] ${relPath}`);
    missingCount++;
  }
}

console.log('\n----------------------------------------------------');
if (missingCount === 0) {
  console.log(`✅ All ${requiredPaths.length} structural files verified successfully!`);
  process.exit(0);
} else {
  console.error(`❌ Verification failed: ${missingCount} files/folders missing.`);
  process.exit(1);
}
