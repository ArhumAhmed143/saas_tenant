const express = require('express');
const auth = require('../../middleware/auth');
const { getSubtasks, createSubtask, toggleSubtask } = require('../../controllers/work/subtasksController');
const router = express.Router();

router.get('/', auth, getSubtasks);
router.post('/', auth, createSubtask);
router.put('/:id', auth, toggleSubtask);

module.exports = router;