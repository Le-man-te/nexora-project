const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const createRateLimit = require('../../middleware/rateLimit');
const controller = require('./auth.controller');

const router = express.Router();
const resetRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
router.post('/forgot-password', resetRateLimit, asyncHandler(controller.forgotPassword));
router.post('/reset-password', resetRateLimit, asyncHandler(controller.resetPassword));
router.post('/verify-email', resetRateLimit, asyncHandler(controller.verifyEmail));

module.exports = router;