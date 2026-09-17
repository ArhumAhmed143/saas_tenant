const express = require('express');
const auth = require('../../middleware/auth');
const { getUsers, updateUserRole, deleteUser } = require('../../controllers/tenant/usersController');
const router = express.Router();

router.get('/', auth, getUsers);
router.put('/:id/role', auth, updateUserRole);
router.delete('/:id', auth, deleteUser);

module.exports = router;