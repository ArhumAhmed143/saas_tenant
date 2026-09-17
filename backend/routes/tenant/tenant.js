const express = require('express');
const auth = require('../../middleware/auth');
const { getTenant, updateTenant } = require('../../controllers/tenant/tenantController');
const router = express.Router();

router.get('/:id', auth, getTenant);
router.put('/:id', auth, updateTenant);

module.exports = router;