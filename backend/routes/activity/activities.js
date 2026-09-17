const express = require('express');
const auth = require('../../middleware/auth');
const { getActivities, createActivity } = require('../../controllers/activity/activitiesController');
const router = express.Router();

router.get('/', auth, getActivities);
router.post('/', auth, createActivity);

module.exports = router;