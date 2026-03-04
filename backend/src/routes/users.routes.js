const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { getProfile, updateProfile, changePassword, uploadCnib, uploadPhoto } = require('../controllers/users.controller');
const upload = require('../middlewares/upload.middleware');

router.use(protect);

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.put('/me/password', changePassword);
router.post('/me/cnib', uploadCnib);
router.post('/me/photo', upload.single('photo'), uploadPhoto);

module.exports = router;
