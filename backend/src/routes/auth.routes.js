const router = require('express').Router();
const { register, verifyEmail, login, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { validate, schemas } = require('../middlewares/validation.middleware');

router.post('/register', validate(schemas.register), register);
router.post('/verify-email', verifyEmail);
router.post('/login', validate(schemas.login), login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
