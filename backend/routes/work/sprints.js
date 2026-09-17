const express = require('express');
const auth = require('../../middleware/auth');
const { getSprints, createSprint } = require('../../controllers/work/sprintsController');
const router = express.Router();

router.get('/', auth, getSprints);
router.post('/', auth, createSprint);

module.exports = router;