const { sql, auth } = require('./_lib');

// GET /api/messages?room=NAME&after=LAST_ID
// after=0 returns the latest 200 messages; otherwise only newer ones.
module.exports = async (req, res) => {
  const me = auth(req);
  if (!me) return res.status(401).json({ error: 'Please log in again.' });

  const room = String(req.query.room || '').trim().toLowerCase().slice(0, 40);
  const after = parseInt(req.query.after, 10) || 0;
  if (!room) return res.status(400).json({ error: 'Missing room.' });

  try {
    const rows = after > 0
      ? await sql`
          SELECT id, type, sender_phone, sender_name, text, created_at
          FROM messages WHERE room = ${room} AND id > ${after}
          ORDER BY id ASC LIMIT 200`
      : await sql`
          SELECT * FROM (
            SELECT id, type, sender_phone, sender_name, text, created_at
            FROM messages WHERE room = ${room}
            ORDER BY id DESC LIMIT 200
          ) t ORDER BY id ASC`;
    res.setHeader('Cache-Control', 'no-store');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Server error.' });
  }
};
