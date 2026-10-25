const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const requireAuth = require('../../middleware/requireAuth');
const controller = require('./settings.controller');

const router = express.Router();
router.use(requireAuth);
router.get('/profile', asyncHandler(controller.getProfile));
router.patch('/profile', asyncHandler(controller.updateProfile));
router.get('/notifications', asyncHandler(controller.getNotifications));
router.patch('/notifications', asyncHandler(controller.updateNotifications));
router.get('/appearance', asyncHandler(controller.getAppearance));
router.patch('/appearance', asyncHandler(controller.updateAppearance));
router.post('/security/password', asyncHandler(controller.updatePassword));
router.patch('/security/two-factor', asyncHandler(controller.updateTwoFactor));
router.get('/security/sessions', asyncHandler(controller.listSessions));
router.delete('/security/sessions/:id', asyncHandler(controller.revokeSession));

module.exports = router;