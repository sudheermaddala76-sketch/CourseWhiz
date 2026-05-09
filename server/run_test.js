const { execSync } = require('child_process');
const fs = require('fs');
try {
  const out = execSync('node test_ingest.js').toString();
  fs.writeFileSync('run_out.txt', out);
} catch (e) {
  fs.writeFileSync('run_out.txt', e.stdout.toString() + '\\n' + e.stderr.toString());
}
