const express = require('express');
const auth = require('../../middleware/auth');
const {
    sendInvite,
    getInviteDetails,
    getPendingInvites,
    cancelInvite
} = require('../../controllers/auth/inviteController');

const router = express.Router();

router.post('/', auth, sendInvite);
router.get('/details/:token', getInviteDetails);
router.get('/', auth, getPendingInvites);
router.delete('/:id', auth, cancelInvite);

module.exports = router;