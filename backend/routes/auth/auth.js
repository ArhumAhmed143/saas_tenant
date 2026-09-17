const express = require('express');
const {
    register,
    registerPlatformOwner,
    login,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword
} = require('../../controllers/auth/authController');

const router = express.Router();

router.post('/register', register);
router.post('/register-platform-owner', registerPlatformOwner);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;