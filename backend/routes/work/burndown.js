const express = require('express');
const auth = require('../../middleware/auth');
const { getBurndown } = require('../../controllers/work/burndownController');
const router = express.Router();

router.get('/', auth, getBurndown);

module.exports = router;