const bcrypt = require('bcryptjs');
const { sql, sign, normalizePhone } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const phone = normalizePhone(req.body?.phone);
  const password = String(req.body?.password || '');
  if (!phone || !password) return res.status(400).json({ error: 'Enter your phone number and password.' });

  try {
    const rows = await sql`SELECT phone, name, pass_hash FROM users WHERE phone = ${phone}`;
    if (!rows.length) return res.status(404).json({ error: 'No account found for that number. Register first.' });
    const ok = await bcrypt.compare(password, rows[0].pass_hash);
    if (!ok) return res.status(401).json({ error: 'Incorrect password.' });
    const user = { phone: rows[0].phone, name: rows[0].name };
    res.json({ token: sign(user), user });
  } catch (e) {
    res.status(500).json({ error: 'Server error.' });
  }
};
