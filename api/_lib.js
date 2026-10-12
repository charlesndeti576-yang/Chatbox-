const { neon } = require('@neondatabase/serverless');
const jwt = require('jsonwebtoken');

const sql = neon(process.env.DATABASE_URL);

function sign(user) {
  return jwt.sign({ phone: user.phone, name: user.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function auth(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  try { return jwt.verify(token, process.env.JWT_SECRET); }
  catch (e) { return null; }
}

const normalizePhone = p => String(p || '').replace(/[^\d+]/g, '');

module.exports = { sql, sign, auth, normalizePhone };
