const express = require('express');
const auth = require('../../middleware/auth');
const { getDepartments, createDepartment, deleteDepartment } = require('../../controllers/tenant/departmentsController');
const router = express.Router();

router.get('/', auth, getDepartments);
router.post('/', auth, createDepartment);
router.delete('/:id', auth, deleteDepartment);

module.exports = router;