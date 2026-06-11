const { MongoClient } = require('mongodb');

const DOC_ID = 'shared';
const COLLECTION = 'state';
let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  const dbName = process.env.MONGODB_DB || 'ct_site';
  cachedClient = new MongoClient(uri, { maxPoolSize: 1 });
  await cachedClient.connect();
  cachedDb = cachedClient.db(dbName);
  return cachedDb;
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return await new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const db = await getDb();
    const col = db.collection(COLLECTION);

    if (req.method === 'GET') {
      const doc = await col.findOne({ _id: DOC_ID });
      res.status(200).json(doc && doc.data ? doc.data : {});
      return;
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = await readBody(req);
      if (!body || typeof body !== 'object') {
        res.status(400).json({ error: 'Invalid body' });
        return;
      }
      await col.updateOne(
        { _id: DOC_ID },
        { $set: { data: body, updatedAt: new Date() } },
        { upsert: true }
      );
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('Allow', 'GET, PUT, POST');
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: String(err && err.message || err) });
  }
};
