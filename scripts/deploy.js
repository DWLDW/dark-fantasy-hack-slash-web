import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 1. Server Configuration
const SERVER_USER = 'ubuntu';
const SERVER_HOST = '193.122.127.129';
const REMOTE_DEST = '/var/www/dark-fantasy';

// 2. Resolve SSH Key
const candidateKeyPaths = [
  process.argv[2],
  process.env.ORACLE_SSH_KEY,
  process.env.SSH_KEY_PATH,
  'C:\\Users\\tooya\\Documents\\xwechat_files\\wxid_oqs5lzgndx6f12_d6b1\\msg\\file\\2026-08\\ssh-key-2026-08-22.key',
  'C:\\Users\\tooya\\Downloads\\ssh-key-2026-08-22.key'
].filter(Boolean);

const keyPath = candidateKeyPaths.find(p => fs.existsSync(p)) || candidateKeyPaths[0];

console.log('====================================================');
console.log('🚀 Dark Fantasy Hack & Slash - Oracle Cloud Deployment');
console.log('====================================================');
console.log(`📡 Server Target: ${SERVER_USER}@${SERVER_HOST}`);
console.log(`🔑 SSH Key Path: ${keyPath}`);

if (!fs.existsSync(keyPath)) {
  console.error(`❌ SSH key not found at: ${keyPath}`);
  console.error('Please pass the key path as an argument: npm run deploy -- "path/to/key.key"');
  process.exit(1);
}

// 3. Find Local Active IPv4 Addresses (for Clash/VPN bind fallback)
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips.sort((a, b) => {
    if (a.startsWith('192.168.')) return -1;
    if (b.startsWith('192.168.')) return 1;
    return 0;
  });
}

// 4. Test SSH Connectivity (Direct vs BindAddress vs Proxy Fallback)
async function testSSH() {
  console.log('\n🔍 Testing SSH connectivity...');

  const runTest = (extraArgs) => {
    return new Promise((resolve) => {
      let settled = false;
      const child = spawn('ssh', [
        ...extraArgs,
        '-i', keyPath,
        '-o', 'BatchMode=yes',
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'PubkeyAcceptedAlgorithms=+ssh-rsa',
        '-o', 'HostKeyAlgorithms=+ssh-rsa',
        '-o', 'ConnectTimeout=4',
        `${SERVER_USER}@${SERVER_HOST}`,
        'echo SSH_OK'
      ]);

      let stdout = '';
      child.stdout.on('data', d => { stdout += d.toString(); });
      child.on('close', code => {
        if (!settled) {
          settled = true;
          resolve(code === 0 && stdout.includes('SSH_OK'));
        }
      });
      child.on('error', () => {
        if (!settled) {
          settled = true;
          resolve(false);
        }
      });
      setTimeout(() => {
        if (!settled) {
          settled = true;
          try { child.kill(); } catch (_) {}
          resolve(false);
        }
      }, 5000);
    });
  };

  // Try 1: Wi-Fi / Local Active IPs
  const localIps = getLocalIPs();
  console.log(`📡 Testing direct & local IP bindings: [${localIps.join(', ')}]...`);

  for (const ip of localIps) {
    if (await runTest(['-o', `BindAddress=${ip}`])) {
      console.log(`✅ SSH connection succeeded with BindAddress=${ip}`);
      return ['-o', `BindAddress=${ip}`, '-o', 'PubkeyAcceptedAlgorithms=+ssh-rsa', '-o', 'HostKeyAlgorithms=+ssh-rsa'];
    }
  }

  // Try 2: Direct SSH Fallback
  if (await runTest([])) {
    console.log('✅ Direct SSH connection successful!');
    return ['-o', 'PubkeyAcceptedAlgorithms=+ssh-rsa', '-o', 'HostKeyAlgorithms=+ssh-rsa'];
  }

  console.error('❌ Could not establish SSH connection. Please check your network or Clash/VPN proxy settings.');
  process.exit(1);
}

async function main() {
  // Step 1: Build Web Project
  console.log('\n📦 Step 1: Building project for production...');
  try {
    execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
    console.log('✅ Build completed successfully.');
  } catch (err) {
    console.error('❌ Build failed:', err);
    process.exit(1);
  }

  // Step 2: Create Tarball of dist
  console.log('\n🗜️ Step 2: Compressing dist archive...');
  const tarPath = path.join(projectRoot, 'dist.tar.gz');

  try {
    const distScriptsDir = path.join(projectRoot, 'dist', 'scripts');
    if (!fs.existsSync(distScriptsDir)) fs.mkdirSync(distScriptsDir, { recursive: true });
    fs.copyFileSync(
      path.join(projectRoot, 'scripts', 'nginx-dark-fantasy.conf'),
      path.join(distScriptsDir, 'nginx-dark-fantasy.conf')
    );

    if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);
    execSync(`tar -czf dist.tar.gz -C dist .`, { cwd: projectRoot, stdio: 'inherit' });
    console.log('✅ Archive dist.tar.gz created.');
  } catch (err) {
    console.error('❌ Failed to create tarball:', err);
    process.exit(1);
  }

  const sshBindArgs = await testSSH();

  // Step 3: Streaming Tarball directly into Remote Extraction
  console.log('\n📤 Step 3: Streaming and extracting directly onto Oracle Cloud Server...');
  const remoteCommand = `
    sudo mkdir -p ${REMOTE_DEST} && \
    sudo rm -rf ${REMOTE_DEST}/* && \
    sudo tar -xzf - -C ${REMOTE_DEST} && \
    sudo chown -R www-data:www-data ${REMOTE_DEST} && \
    sudo chmod -R a+rX ${REMOTE_DEST} && \
    sudo rm -f /etc/nginx/sites-enabled/default && \
    if [ -f ${REMOTE_DEST}/scripts/nginx-dark-fantasy.conf ]; then
      sudo cp ${REMOTE_DEST}/scripts/nginx-dark-fantasy.conf /etc/nginx/sites-available/dark-fantasy.conf
      sudo ln -sf /etc/nginx/sites-available/dark-fantasy.conf /etc/nginx/sites-enabled/dark-fantasy.conf
    fi && \
    sudo nginx -t && \
    sudo systemctl reload nginx && \
    echo "DEPLOY_COMPLETE_SUCCESS"
  `;

  const sshProcess = spawn('ssh', [
    ...sshBindArgs,
    '-i', keyPath,
    '-o', 'BatchMode=yes',
    '-o', 'StrictHostKeyChecking=no',
    `${SERVER_USER}@${SERVER_HOST}`,
    remoteCommand
  ]);

  const fileStream = fs.createReadStream(tarPath);
  fileStream.pipe(sshProcess.stdin);

  let remoteOutput = '';
  sshProcess.stdout.on('data', (data) => {
    remoteOutput += data.toString();
  });
  sshProcess.stderr.on('data', (data) => {
    remoteOutput += data.toString();
  });

  sshProcess.on('close', (code) => {
    if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);

    if (code === 0 && remoteOutput.includes('DEPLOY_COMPLETE_SUCCESS')) {
      console.log('\n====================================================');
      console.log('🎉 DEPLOYMENT SUCCESSFUL (HTTPS SSL SECURED)!');
      console.log('====================================================');
      console.log(`🔒 Live Secure Game URL: https://193.122.127.129.sslip.io`);
      console.log(`🌐 Live IP Game URL: http://${SERVER_HOST} (Auto redirects to HTTPS)`);
      console.log('누구나 위 보안 주소로 모든 모바일/PC 브라우저에서 안전하게 접속 가능합니다!');
    } else {
      console.error('❌ Remote deployment failed:', remoteOutput);
      process.exit(1);
    }
  });
}

main();
