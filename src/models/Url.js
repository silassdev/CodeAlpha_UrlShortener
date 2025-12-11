const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, index: true },
  clicks: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null }
}, { timestamps: true });

UrlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Url', UrlSchema);