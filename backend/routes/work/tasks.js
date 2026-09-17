const express = require('express');
const auth = require('../../middleware/auth');
const { getTasks, createTask, updateTaskStatus } = require('../../controllers/work/tasksController');
const router = express.Router();

router.get('/', auth, getTasks);
router.post('/', auth, createTask);
router.patch('/:id/status', auth, updateTaskStatus);

module.exports = router;