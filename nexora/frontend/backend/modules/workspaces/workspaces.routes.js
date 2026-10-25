const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const requireAuth = require('../../middleware/requireAuth');
const controller = require('./workspaces.controller');

const router = express.Router();
router.use(requireAuth);
router.get('/', asyncHandler(controller.list));
router.post('/', asyncHandler(controller.create));
router.get('/:id/members', asyncHandler(controller.members));
router.get('/:id', asyncHandler(controller.get));
router.patch('/:id', asyncHandler(controller.update));
router.post('/:id/archive', asyncHandler(controller.archive));
router.post('/:id/restore', asyncHandler(controller.restore));
router.delete('/:id', asyncHandler(controller.remove));

module.exports = router;