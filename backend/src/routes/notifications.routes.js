const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { getNotifications, marquerCommeLue, getUnreadCount } = require('../controllers/notifications.controller');

router.use(protect);

router.get('/', getNotifications);
router.put('/:notificationId/lire', marquerCommeLue);
router.get('/unread-count', getUnreadCount);

module.exports = router;
