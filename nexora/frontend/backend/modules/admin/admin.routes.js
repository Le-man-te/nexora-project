const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const requireAuth = require('../../middleware/requireAuth');
const requirePlatformAdmin = require('../../middleware/requirePlatformAdmin');
const controller = require('./admin.controller');

const router = express.Router();
router.use(requireAuth);
router.get('/summary', asyncHandler(controller.summary));
router.use(requirePlatformAdmin);
router.get('/overview', asyncHandler(controller.overview));
router.patch('/users/:userId', asyncHandler(controller.setUserStatus));
router.patch('/workspaces/:workspaceId', asyncHandler(controller.setWorkspaceStatus));

module.exports = router;