const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const requireAuth = require('../../middleware/requireAuth');
const createRateLimit = require('../../middleware/rateLimit');
const controller = require('./ai.controller');

const router = express.Router();
router.use(requireAuth);
const chatRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user.id,
  message: 'Too many AI requests. Please wait before trying again.',
});
router.post('/chat', chatRateLimit, asyncHandler(controller.chat));
router.get('/conversations', asyncHandler(controller.list));
router.get('/conversations/:id', asyncHandler(controller.get));
router.delete('/conversations/:id', asyncHandler(controller.remove));

module.exports = router;