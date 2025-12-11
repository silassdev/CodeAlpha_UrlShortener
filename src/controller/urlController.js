const validUrl = require('valid-url');
const Url = require('../models/Url');
const generateCode = require('../utils/generateCode');

exports.shorten = async (req, res) => {
  const { originalUrl, customCode, expiresInDays } = req.body;
  const cleanUrl = (originalUrl || '').trim();
  if (!cleanUrl || !validUrl.isWebUri(cleanUrl)) {
    return res.status(400).json({ error: 'Invalid or missing originalUrl' });
  }

  try {
    const existing = await Url.findOne({ originalUrl: cleanUrl });
    if (existing) {
      return res.json({ shortUrl: `${process.env.BASE_URL}/${existing.code}`, code: existing.code });
    }

    let code = customCode && /^[0-9a-zA-Z_-]{3,20}$/.test(customCode) ? customCode : generateCode();

    while (await Url.findOne({ code })) {
      code = generateCode();
    }

    const doc = new Url({
      originalUrl: cleanUrl,
      code,
      expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 3600 * 1000) : undefined
    });

    await doc.save();
    return res.status(201).json({ shortUrl: `${process.env.BASE_URL}/${code}`, code });
  } catch (err) {
    console.error('shorten error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.info = async (req, res) => {
  try {
    const doc = await Url.findOne({ code: req.params.code }).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json({
      originalUrl: doc.originalUrl,
      code: doc.code,
      clicks: doc.clicks,
      createdAt: doc.createdAt,
      expiresAt: doc.expiresAt
    });
  } catch (err) {
    console.error('info error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
