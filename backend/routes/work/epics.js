const express = require('express');
const auth = require('../../middleware/auth');
const { getEpics } = require('../../controllers/work/epicsController');
const router = express.Router();

router.get('/', auth, getEpics);

module.exports = router;