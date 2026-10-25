const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const requireAuth = require('../../middleware/requireAuth');
const controller = require('./search.controller');

const router = express.Router();
router.use(requireAuth);
router.get('/', asyncHandler(controller.search));

module.exports = router;