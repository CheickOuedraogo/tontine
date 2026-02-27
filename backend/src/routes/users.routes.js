const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { getProfile, updateProfile, changePassword, uploadCnib } = require('../controllers/users.controller');

router.use(protect);

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.put('/me/password', changePassword);
router.post('/me/cnib', uploadCnib);

module.exports = router;
