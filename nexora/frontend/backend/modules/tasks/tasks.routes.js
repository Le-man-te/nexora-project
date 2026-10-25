const express = require('express');
const { createResourceRouter } = require('../../utils/resourceModule');
const asyncHandler = require('../../utils/asyncHandler');
const requireAuth = require('../../middleware/requireAuth');
const controller = require('./tasks.controllers');
module.exports = createResourceRouter(express, controller, requireAuth, asyncHandler);