const express = require('express');
const { createResourceRouter } = require('../../utils/resourceModule');
const asyncHandler = require('../../utils/asyncHandler');
const requireAuth = require('../../middleware/requireAuth');
const controller = require('./documents.ciontroller');
module.exports = createResourceRouter(express, controller, requireAuth, asyncHandler);