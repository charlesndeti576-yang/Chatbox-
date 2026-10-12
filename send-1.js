const { sql, auth } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const me = auth(req);
  if (!me) return res.status(401).json({ error: 'Please log in again.' });

  const room = String(req.body?.room || '').trim().toLowerCase().slice(0, 40);
  if (!room) return res.status(400).json({ error: 'Missing room.' });

  const isSystem = req.body?.type === 'system';
  // System messages are generated here so nobody can fake them.
  const text = isSystem
    ? me.name + ' joined the room'
    : String(req.body?.text || '').trim().slice(0, 2000);
  if (!text) return res.status(400).json({ error: 'Missing text.' });

  try {
    const rows = await sql`
      INSERT INTO messages (room, type, sender_phone, sender_name, text)
      VALUES (${room}, ${isSystem ? 'system' : 'msg'}, ${me.phone}, ${me.name}, ${text})
      RETURNING id`;
    res.json({ id: rows[0].id });
  } catch (e) {
    res.status(500).json({ error: 'Server error.' });
  }
};
