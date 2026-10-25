const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const requireAuth = require('../../middleware/requireAuth');
const controller = require('./admin.controller');

const router = express.Router();
router.use(requireAuth);
router.get('/summary', asyncHandler(controller.summary));

module.exports = router;