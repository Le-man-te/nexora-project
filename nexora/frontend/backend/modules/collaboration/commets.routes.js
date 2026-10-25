const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const requireAuth = require('../../middleware/requireAuth');
const commentsController = require('./comments.controller');
const activityService = require('./activity.service');
const collaborationService = require('./collaboration.service');
const createRateLimit = require('../../middleware/rateLimit');

const router = express.Router();
router.use(requireAuth);
const invitationRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user.id,
  message: 'Too many invitations. Please try again later.',
});
router.get('/activity', asyncHandler(async (req, res) => {
  res.json({ activity: await activityService.list(req.user.id, req.query) });
}));
router.get('/invitations', asyncHandler(async (req, res) => {
  res.json({ invitations: await collaborationService.listInvitations(req.user.id, req.query) });
}));
router.post('/invitations', invitationRateLimit, asyncHandler(async (req, res) => {
  const invitation = await collaborationService.createInvitation(req.user.id, req.body);
  res.status(201).json({ invitation, message: 'Invitation sent successfully.' });
}));
router.post('/invitations/:id/resend', invitationRateLimit, asyncHandler(async (req, res) => {
  await collaborationService.resendInvitation(req.user.id, req.params.id);
  res.json({ message: 'Invitation resent successfully.' });
}));
router.delete('/invitations/:id', asyncHandler(async (req, res) => {
  await collaborationService.revokeInvitation(req.user.id, req.params.id);
  res.json({ message: 'Invitation revoked successfully.' });
}));
router.post('/invitations/:id/accept', asyncHandler(async (req, res) => {
  await collaborationService.respondToInvitation(req.user, req.params.id, true);
  res.json({ message: 'Invitation accepted successfully.' });
}));
router.post('/invitations/:id/decline', asyncHandler(async (req, res) => {
  await collaborationService.respondToInvitation(req.user, req.params.id, false);
  res.json({ message: 'Invitation declined.' });
}));
router.get('/comments', asyncHandler(commentsController.list));
router.post('/comments', asyncHandler(commentsController.create));
router.get('/comments/:id', asyncHandler(commentsController.get));
router.patch('/comments/:id', asyncHandler(commentsController.update));
router.delete('/comments/:id', asyncHandler(commentsController.remove));

module.exports = router;