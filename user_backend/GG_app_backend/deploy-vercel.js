/**
 * Script to prepare and deploy the backend to Vercel
 * 
 * This script helps ensure that the backend is properly deployed
 * with all routes and handles working correctly, especially
 * the profile update endpoint.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Preparing backend deployment to Vercel ===');

// 1. Check that required files exist
const requiredFiles = [
  'index.js',
  'vercel.json',
  '.env.production',
  'routes/authRoutes.js',
  'controllers/authController.js'
];

console.log('\n[1] Checking required files...');
let allFilesExist = true;

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ERROR: ${file} is missing`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log('Please fix missing files before deploying');
  process.exit(1);
}

// 2. Verify authRoutes.js has the update profile endpoint
console.log('\n[2] Checking route definitions...');
const authRoutesPath = path.join(__dirname, 'routes/authRoutes.js');
const authRoutesContent = fs.readFileSync(authRoutesPath, 'utf8');

if (authRoutesContent.includes('router.put(\'/profile\'')) {
  console.log('✅ Update profile route is defined');
} else {
  console.log('❌ ERROR: Update profile route is not defined in authRoutes.js');
  console.log('Please add: router.put(\'/profile\', authenticate, updateProfile);');
  process.exit(1);
}

// 3. Verify the updateProfile function is exported
console.log('\n[3] Checking controller exports...');
const authControllerPath = path.join(__dirname, 'controllers/authController.js');
const authControllerContent = fs.readFileSync(authControllerPath, 'utf8');

// Debug logging
console.log('Controller content snippet:');
const exportLines = authControllerContent.split('\n')
  .filter(line => line.includes('exports') || line.includes('updateProfile'))
  .map(line => `  ${line.trim()}`);
console.log(exportLines.join('\n'));

if (authControllerContent.includes('updateProfile')) {
  // Use a more reliable check for exports
  const moduleExportsRegex = /module\.exports\s*=\s*{[^}]*updateProfile[^}]*}/;
  if (moduleExportsRegex.test(authControllerContent)) {
    console.log('✅ updateProfile function is exported');
  } else {
    console.log('❌ ERROR: updateProfile function is defined but not exported');
    console.log('Please add updateProfile to the module.exports object');
    
    // Show export snippet
    const moduleExportsLine = authControllerContent.split('\n')
      .find(line => line.includes('module.exports'));
    console.log('Module exports line:', moduleExportsLine);
    
    process.exit(1);
  }
} else {
  console.log('❌ ERROR: updateProfile function is not defined in authController.js');
  process.exit(1);
}

// 4. Verify vercel.json configuration
console.log('\n[4] Checking Vercel configuration...');
const vercelConfigPath = path.join(__dirname, 'vercel.json');
const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));

if (vercelConfig.routes && 
    vercelConfig.routes.length > 0 && 
    vercelConfig.routes[0].dest === 'index.js') {
  console.log('✅ Vercel routing configuration looks correct');
} else {
  console.log('❌ WARNING: Vercel configuration might not be optimal');
  console.log('Consider using this configuration:');
  console.log(`
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
  `);
}

// 5. Prepare for deployment
console.log('\n[5] All checks passed! Ready for deployment');
console.log('\nTo deploy, run:');
console.log('vercel --prod');

// Optional: Deploy automatically if --deploy flag is provided
if (process.argv.includes('--deploy')) {
  console.log('\nDeploying automatically...');
  try {
    const output = execSync('vercel --prod', { stdio: 'inherit' });
    console.log('Deployment successful!');
  } catch (error) {
    console.error('Deployment failed:', error.message);
  }
}

console.log('\n=== Deployment preparation complete ===');
