require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { nanoid } = require('nanoid');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, '..', 'public')));

// Schema
const shortSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  longUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Short = mongoose.models.Short || mongoose.model('Short', shortSchema);

// Helpers
function normalizeToAbsolute(longUrl, req) {
  if (!longUrl || typeof longUrl !== 'string') throw new Error('Invalid URL');
  longUrl = longUrl.trim();
  if (/^\//.test(longUrl)) return `${req.protocol}://${req.get('host')}${longUrl}`;
  if (/^https?:\/\//i.test(longUrl)) return longUrl;
  try {
    const candidate = 'https://' + longUrl;
    new URL(candidate);
    return candidate;
  } catch (err) {
    throw new Error('Invalid URL format');
  }
}

app.post('/shorten', async (req, res) => {
  try {
    const { longUrl } = req.body;
    if (!longUrl) return res.status(400).json({ error: 'longUrl is required' });

    const normalized = normalizeToAbsolute(longUrl, req);
    const existing = await Short.findOne({ longUrl: normalized }).lean();
    if (existing) {
      return res.json({
        code: existing.code,
        shortUrl: `${req.protocol}://${req.get('host')}/${existing.code}`
      });
    }

    const code = nanoid(7);
    await Short.create({ code, longUrl: normalized });

    return res.json({
      code,
      shortUrl: `${req.protocol}://${req.get('host')}/${code}`
    });
  } catch (err) {
    console.error('POST /shorten error:', err);
    return res.status(400).json({ error: err.message || 'Server error' });
  }
});

app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const doc = await Short.findOne({ code }).lean();
    if (!doc) return res.status(404).send('Short URL not found');
    return res.redirect(302, doc.longUrl);
  } catch (err) {
    console.error('Redirect error:', err);
    return res.status(500).send('Server error');
  }
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urlshort';
let cached = global._mongoose;

async function connectToDatabase() {
  if (cached && cached.conn) return cached.conn;
  if (!cached) cached = global._mongoose = { conn: null, promise: null };

  if (!cached.promise) {
    const opts = { useNewUrlParser: true, useUnifiedTopology: true };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const handler = async (req, res) => {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (err) {
    console.error('DB connect error:', err);
    res.statusCode = 500;
    res.end('Database connection error');
  }
};

module.exports = serverless(handler);
