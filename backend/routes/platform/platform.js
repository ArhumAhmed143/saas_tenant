const express = require('express');
const auth = require('../../middleware/auth');
const {
    getAllTenants,
    getTenantById,
    updateTenant,
    deleteTenant,
    getAllUsers,
    deleteUser,
    getPlatformActivities
} = require('../../controllers/platform/platformController');

const router = express.Router();

// Middleware: Only Platform Owner
const platformOwnerOnly = (req, res, next) => {
    if (req.role !== 'PlatformOwner') {
        return res.status(403).json({ message: 'Access denied. Platform Owners only.' });
    }
    next();
};

router.get('/tenants', auth, platformOwnerOnly, getAllTenants);
router.get('/tenants/:id', auth, platformOwnerOnly, getTenantById);
router.put('/tenants/:id', auth, platformOwnerOnly, updateTenant);
router.delete('/tenants/:id', auth, platformOwnerOnly, deleteTenant);
router.get('/users', auth, platformOwnerOnly, getAllUsers);
router.delete('/users/:id', auth, platformOwnerOnly, deleteUser);
router.get('/activities', auth, platformOwnerOnly, getPlatformActivities);

module.exports = router;