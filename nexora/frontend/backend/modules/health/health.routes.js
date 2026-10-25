const express = require('express');
const { getPool } = require('../../database/pools');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();
router.get('/', (_req, res) => {
  res.json({ ok: true, service: 'nexora-backend', timestamp: new Date().toISOString() });
});
router.get('/ready', asyncHandler(async (_req, res) => {
  await getPool().query('SELECT 1');
  res.json({ ok: true, database: 'connected' });
}));

module.exports = router;