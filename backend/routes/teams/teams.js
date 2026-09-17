const express = require('express');
const auth = require('../../middleware/auth');
const { getTeams, createTeam, deleteTeam } = require('../../controllers/teams/teamsController');
const router = express.Router();

router.get('/', auth, getTeams);
router.post('/', auth, createTeam);
router.delete('/:id', auth, deleteTeam);

module.exports = router;