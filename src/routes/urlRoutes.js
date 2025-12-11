const express = require('express');
const router = express.Router();
const urlController = require('../controller/urlController');

const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/shorten', asyncHandler(urlController.shorten));
router.get('/info/:code', asyncHandler(urlController.info));

module.exports = router;
