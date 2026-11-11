import { execSync } from 'node:child_process';
import process from 'node:process';
import fs from 'node:fs';

// Bersihkan variabel proxy sistem yang tidak valid agar tidak merusak Axios di SonarScanner
for (const key of ['http_proxy', 'HTTP_PROXY', 'https_proxy', 'HTTPS_PROXY', 'all_proxy', 'ALL_PROXY']) {
  const val = process.env[key];
  if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
    delete process.env[key];
  }
}

// Baca token dari file .sonar-token jika belum ada di process.env
if (!process.env.SONAR_TOKEN && fs.existsSync('.sonar-token')) {
  try {
    process.env.SONAR_TOKEN = fs.readFileSync('.sonar-token', 'utf-8').trim();
  } catch {
    // Abaikan error pembacaan file token
  }
}

const extraArgs = process.argv.slice(2).join(' ');
const cmd = `npx --yes sonarqube-scanner ${extraArgs}`.trim();

try {
  execSync(cmd, {
    stdio: 'inherit',
    env: process.env,
  });
} catch (error) {
  process.exit(error.status ?? 1);
}
