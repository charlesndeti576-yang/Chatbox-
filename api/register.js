const bcrypt = require('bcryptjs');
const { sql, sign, normalizePhone } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const name = String(req.body?.name || '').trim().slice(0, 24);
  const phone = normalizePhone(req.body?.phone);
  const password = String(req.body?.password || '');

  if (!name) return res.status(400).json({ error: 'Enter your name.' });
  if (phone.replace('+', '').length < 7) return res.status(400).json({ error: 'Enter a valid phone number.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  try {
    const hash = await bcrypt.hash(password, 10);
    const rows = await sql`
      INSERT INTO users (phone, name, pass_hash) VALUES (${phone}, ${name}, ${hash})
      ON CONFLICT (phone) DO NOTHING RETURNING phone, name`;
    if (!rows.length) return res.status(409).json({ error: 'That phone number is already registered — try logging in.' });
    res.json({ token: sign(rows[0]), user: rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Server error.' });
  }
};
