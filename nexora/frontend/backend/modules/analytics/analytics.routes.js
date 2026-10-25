const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const requireAuth = require('../../middleware/requireAuth');
const controller = require('./analytics.controller');

const router = express.Router();
router.use(requireAuth);
router.get('/overview', asyncHandler(controller.overview));
router.get('/trends', asyncHandler(controller.trends));
router.get('/projects', asyncHandler(controller.projects));
router.get('/team', asyncHandler(controller.team));

module.exports = router;