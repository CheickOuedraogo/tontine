const router = require('express').Router();
const { register, login } = require('../controllers/auth.controller');
const { validate, schemas } = require('../middlewares/validation.middleware');

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);

module.exports = router;
