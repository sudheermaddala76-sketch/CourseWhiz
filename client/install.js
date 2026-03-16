const { execSync } = require('child_process');
const fs = require('fs');
try {
  console.log('Starting npm install from node script...');
  const output = execSync('npm install @azure/msal-browser @azure/msal-react @react-oauth/google --legacy-peer-deps', { encoding: 'utf-8' });
  fs.writeFileSync('install.log', output);
  console.log('Installation successful. Log written.');
} catch (e) {
  console.error('Installation failed:');
  fs.writeFileSync('install.log', e.stdout || e.message);
}
