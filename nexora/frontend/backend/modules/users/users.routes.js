const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const requireAuth = require('../../middleware/requireAuth');
const controller = require('./users.controllers');

const router = express.Router();
router.use(requireAuth);
router.get('/me', asyncHandler(controller.getProfile));
router.patch('/me', asyncHandler(controller.updateProfile));

module.exports = router;