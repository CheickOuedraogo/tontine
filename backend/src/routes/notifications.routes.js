const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { 
  getNotifications, marquerCommeLue, getUnreadCount, 
  supprimerNotification, toutEffacer 
} = require('../controllers/notifications.controller');

router.use(protect);

router.get('/', getNotifications);
router.delete('/', toutEffacer);
router.put('/:notificationId/lire', marquerCommeLue);
router.delete('/:notificationId', supprimerNotification);
router.get('/unread-count', getUnreadCount);

module.exports = router;
