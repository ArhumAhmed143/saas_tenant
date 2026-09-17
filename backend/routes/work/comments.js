const express = require('express');
const auth = require('../../middleware/auth');
const { getComments, createComment } = require('../../controllers/work/commentsController');
const router = express.Router();

router.get('/', auth, getComments);
router.post('/', auth, createComment);

module.exports = router;