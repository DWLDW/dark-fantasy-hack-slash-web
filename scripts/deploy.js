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
const defaultKeyPath = 'C:\\Users\\tooya\\Downloads\\ssh-key-2026-08-22.key';
const envKeyPath = process.env.ORACLE_SSH_KEY || process.env.SSH_KEY_PATH;
const keyPath = process.argv[2] || envKeyPath || defaultKeyPath;

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
  return ips;
}

// 4. Test SSH Connectivity (Direct vs BindAddress Fallback)
async function testSSH() {
  console.log('\n🔍 Testing SSH connectivity...');

  const runTest = (extraArgs) => {
    return new Promise((resolve) => {
      const child = spawn('ssh', [
        ...extraArgs,
        '-i', keyPath,
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'ConnectTimeout=5',
        `${SERVER_USER}@${SERVER_HOST}`,
        'echo SSH_OK'
      ]);

      let stdout = '';
      child.stdout.on('data', d => { stdout += d.toString(); });
      child.on('close', code => {
        resolve(code === 0 && stdout.includes('SSH_OK'));
      });
      child.on('error', () => resolve(false));
    });
  };

  // Try 1: Direct SSH
  if (await runTest([])) {
    console.log('✅ Direct SSH connection successful!');
    return [];
  }

  // Try 2: Bind to local active IPs
  const localIps = getLocalIPs();
  console.log(`⚠️ Direct SSH failed. Testing fallback local IP bindings: [${localIps.join(', ')}]...`);

  for (const ip of localIps) {
    if (await runTest(['-o', `BindAddress=${ip}`])) {
      console.log(`✅ SSH connection succeeded with BindAddress=${ip}`);
      return ['-o', `BindAddress=${ip}`];
    }
  }

  console.error('❌ Could not establish SSH connection. Please check your network or Clash/VPN proxy settings.');
  process.exit(1);
}

async function main() {
  const sshBindArgs = await testSSH();

  // 5. Build Web Project
  console.log('\n📦 Step 1: Building project for production...');
  try {
    execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
    console.log('✅ Build completed successfully.');
  } catch (err) {
    console.error('❌ Build failed:', err);
    process.exit(1);
  }

  // 6. Create Tarball of dist
  console.log('\n🗜️ Step 2: Compressing dist archive...');
  const tarPath = path.join(projectRoot, 'dist.tar.gz');

  try {
    if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);
    execSync(`tar -czf dist.tar.gz -C dist .`, { cwd: projectRoot, stdio: 'inherit' });
    console.log('✅ Archive dist.tar.gz created.');
  } catch (err) {
    console.error('❌ Failed to create tarball:', err);
    process.exit(1);
  }

  // 7. Streaming Tarball directly into Remote Extraction
  console.log('\n📤 Step 3: Streaming and extracting directly onto Oracle Cloud Server...');
  const remoteCommand = `
    sudo mkdir -p ${REMOTE_DEST} && \
    sudo rm -rf ${REMOTE_DEST}/* && \
    sudo tar -xzf - -C ${REMOTE_DEST} && \
    sudo chown -R www-data:www-data ${REMOTE_DEST} && \
    sudo chmod -R 755 ${REMOTE_DEST} && \
    sudo systemctl reload nginx && \
    echo "DEPLOY_COMPLETE_SUCCESS"
  `;

  const sshProcess = spawn('ssh', [
    ...sshBindArgs,
    '-i', keyPath,
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
      console.log('🎉 DEPLOYMENT SUCCESSFUL!');
      console.log('====================================================');
      console.log(`🌐 Live Game URL: http://${SERVER_HOST}`);
      console.log('누구나 위 주소로 웹 브라우저에서 즉시 접속하여 플레이할 수 있습니다!');
    } else {
      console.error('❌ Remote deployment failed:', remoteOutput);
      process.exit(1);
    }
  });
}

main();
