const express = require('express');
const auth = require('../../middleware/auth');
const { getTenantById, updateTenantById, deleteTenantById } = require('../../controllers/tenant/tenantController');
const router = express.Router();

router.get('/:id', auth, getTenantById);
router.put('/:id', auth, updateTenantById);
router.delete('/:id', auth, deleteTenantById);

module.exports = router;