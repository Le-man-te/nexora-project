const express = require('express');
const { getMongoDatabase } = require('../../database/mongo');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();
router.get('/', (_req, res) => {
  res.json({ ok: true, service: 'nexora-backend', timestamp: new Date().toISOString() });
});
router.get('/ready', asyncHandler(async (_req, res) => {
  await getMongoDatabase().command({ ping: 1 });
  res.json({ ok: true, database: 'connected' });
}));

module.exports = router;