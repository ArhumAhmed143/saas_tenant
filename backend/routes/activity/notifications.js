const express = require('express');
const auth = require('../../middleware/auth');
const { getNotifications } = require('../../controllers/activity/notificationsController');
const router = express.Router();

router.get('/', auth, getNotifications);

module.exports = router;