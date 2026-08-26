import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const SAVES_DIR = path.join(DATA_DIR, 'saves');

// Ensure data directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(SAVES_DIR)) fs.mkdirSync(SAVES_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({}, null, 2));
if (!fs.existsSync(SESSIONS_FILE)) fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}, null, 2));

// Helper: Read/Write JSON safely
function readJSON(file, fallback = {}) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const content = fs.readFileSync(file, 'utf-8');
    return JSON.parse(content || '{}');
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return fallback;
  }
}

function writeJSON(file, data) {
  try {
    const tmp = `${file}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, file);
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

// Password Hashing Helper using Node crypto PBKDF2
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  const check = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return check === hash;
}

// Middleware: Authenticate Session Token
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
  }

  const sessions = readJSON(SESSIONS_FILE, {});
  const session = sessions[token];

  if (!session || !session.username) {
    return res.status(401).json({ error: '유효하지 않거나 만료된 세션입니다. 다시 로그인해주세요.' });
  }

  req.user = session;
  req.token = token;
  next();
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || typeof username !== 'string' || username.trim().length < 2) {
      return res.status(400).json({ error: '아이디는 최소 2자 이상 입력해주세요.' });
    }
    if (!password || typeof password !== 'string' || password.length < 4) {
      return res.status(400).json({ error: '비밀번호는 최소 4자 이상 입력해주세요.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const users = readJSON(USERS_FILE, {});

    if (users[cleanUsername]) {
      return res.status(409).json({ error: '이미 존재하는 아이디입니다.' });
    }

    const { hash, salt } = hashPassword(password);
    const userRecord = {
      username: cleanUsername,
      displayName: username.trim(),
      hash,
      salt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users[cleanUsername] = userRecord;
    writeJSON(USERS_FILE, users);

    // Create session token
    const token = crypto.randomBytes(32).toString('hex');
    const sessions = readJSON(SESSIONS_FILE, {});
    sessions[token] = {
      username: cleanUsername,
      displayName: userRecord.displayName,
      createdAt: new Date().toISOString()
    };
    writeJSON(SESSIONS_FILE, sessions);

    res.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      token,
      user: {
        username: cleanUsername,
        displayName: userRecord.displayName
      },
      saveData: null
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: '회원가입 처리 중 오류가 발생했습니다.' });
  }
});

// 2. Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: '아이디와 비밀번호를 모두 입력해주세요.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const users = readJSON(USERS_FILE, {});
    const user = users[cleanUsername];

    if (!user || !verifyPassword(password, user.hash, user.salt)) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

    // Create new session token
    const token = crypto.randomBytes(32).toString('hex');
    const sessions = readJSON(SESSIONS_FILE, {});
    sessions[token] = {
      username: cleanUsername,
      displayName: user.displayName || cleanUsername,
      createdAt: new Date().toISOString()
    };
    writeJSON(SESSIONS_FILE, sessions);

    // Load user cloud save data if exists
    const saveFile = path.join(SAVES_DIR, `${cleanUsername}.json`);
    const cloudSave = readJSON(saveFile, null);

    res.json({
      success: true,
      message: '로그인에 성공했습니다.',
      token,
      user: {
        username: cleanUsername,
        displayName: user.displayName || cleanUsername
      },
      saveData: cloudSave
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' });
  }
});

// 3. Load Cloud Save
app.get('/api/save/load', authenticate, (req, res) => {
  try {
    const saveFile = path.join(SAVES_DIR, `${req.user.username}.json`);
    const cloudSave = readJSON(saveFile, null);
    res.json({
      success: true,
      saveData: cloudSave
    });
  } catch (err) {
    console.error('Load save error:', err);
    res.status(500).json({ error: '세이브 데이터를 불러오는 중 오류가 발생했습니다.' });
  }
});

// 4. Sync / Upload Cloud Save
app.post('/api/save/sync', authenticate, (req, res) => {
  try {
    const { saveData } = req.body || {};

    if (!saveData || typeof saveData !== 'object') {
      return res.status(400).json({ error: '유효한 세이브 데이터가 필요합니다.' });
    }

    const payload = {
      ...saveData,
      lastSyncedAt: new Date().toISOString(),
      syncedUser: req.user.username
    };

    const saveFile = path.join(SAVES_DIR, `${req.user.username}.json`);
    writeJSON(saveFile, payload);

    res.json({
      success: true,
      message: '클라우드에 안전하게 백업 및 동기화되었습니다.',
      syncedAt: payload.lastSyncedAt
    });
  } catch (err) {
    console.error('Save sync error:', err);
    res.status(500).json({ error: '세이브 동기화 중 오류가 발생했습니다.' });
  }
});

// 5. Logout
app.post('/api/auth/logout', authenticate, (req, res) => {
  try {
    const sessions = readJSON(SESSIONS_FILE, {});
    delete sessions[req.token];
    writeJSON(SESSIONS_FILE, sessions);
    res.json({ success: true, message: '로그아웃되었습니다.' });
  } catch (err) {
    res.json({ success: true });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🗡️ Dark Fantasy Auth & Cloud Save API server running on port ${PORT}`);
});
