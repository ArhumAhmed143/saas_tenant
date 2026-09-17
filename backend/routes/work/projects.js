const express = require('express');
const auth = require('../../middleware/auth');
const { getProjects, createProject, deleteProject } = require('../../controllers/work/projectsController');
const router = express.Router();

router.get('/', auth, getProjects);
router.post('/', auth, createProject);
router.delete('/:id', auth, deleteProject);

module.exports = router;