require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const urlRoutes = require('./src/routes/urlRoutes');

const app = express();

// security + parsing
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// rate limiter
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

// serve frontend static files from project-root/public
app.use(express.static(path.join(__dirname, 'public')));

// API routes (mounted at /api)
app.use('/api', urlRoutes);

// redirect route (short code) - must come after static + API
const Url = require('./src/models/Url');
app.get('/:code', async (req, res, next) => {
  try {
    const code = req.params.code;
    const doc = await Url.findOne({ code });
    if (!doc) return res.status(404).send('Short URL not found');
    doc.clicks = (doc.clicks || 0) + 1;
    await doc.save();
    return res.redirect(doc.originalUrl);
  } catch (err) {
    next(err);
  }
});

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// start
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codealpha_shortener';
mongoose.set('strictQuery', false);
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on ${process.env.BASE_URL || `http://localhost:${PORT}`}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
