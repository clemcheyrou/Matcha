import express from 'express';
import { getNotificationsController, markAsReadController } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotificationsController);
router.patch('/:notificationId/read', markAsReadController);

export default router;