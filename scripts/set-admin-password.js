#!/usr/bin/env node
// Sets a new admin password for local login.
// Prompts for the password (hidden), stores only a bcrypt hash as
// ADMIN_PASSWORD_HASH in .env.local, and removes any plain-text ADMIN_PASSWORD.
// Usage: node scripts/set-admin-password.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const bcrypt = require('bcryptjs');

const envFile = process.env.ENV_FILE || path.join(process.cwd(), '.env.local');

function ask(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(prompt)) rl.output.write(s); };
    rl.question(prompt, (answer) => { rl.close(); process.stdout.write('\n'); resolve(answer); });
  });
}

(async () => {
  const pw = process.env.NEW_ADMIN_PASSWORD || await ask('New admin password: ');
  if (!process.env.NEW_ADMIN_PASSWORD) {
    const again = await ask('Type it again: ');
    if (pw !== again) { console.error('Passwords did not match. Nothing changed.'); process.exit(1); }
  }
  if (pw.length < 10) { console.error('Use at least 10 characters. Nothing changed.'); process.exit(1); }

  const hash = await bcrypt.hash(pw, 12);
  // Next.js expands $VARS in env files, so escape every $ in the hash.
  const line = 'ADMIN_PASSWORD_HASH=' + hash.replace(/\$/g, '\\$');

  let lines = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf8').split('\n') : [];
  lines = lines.filter((l) => !/^ADMIN_PASSWORD(_HASH)?=/.test(l));
  if (!lines.some((l) => /^ADMIN_USERNAME=/.test(l))) lines.push('ADMIN_USERNAME=admin');
  const userIdx = lines.findIndex((l) => /^ADMIN_USERNAME=/.test(l));
  lines.splice(userIdx + 1, 0, line);
  fs.writeFileSync(envFile, lines.join('\n'));

  console.log('Saved. Restart the dev server, then log in with username "' +
    (lines[userIdx].split('=')[1] || 'admin') + '" and your new password.');
  console.log('For the live site, add this to Vercel as ADMIN_PASSWORD_HASH (without the backslashes):');
  console.log(hash);
})();
