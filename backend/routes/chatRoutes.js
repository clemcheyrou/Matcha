import express from 'express';
import { createNewChatController, getChatHeaderController, getChatListController, getMessagesController, markMessagesAsReadController, getIsChatExistController } from '../controllers/chatController.js';

const router = express.Router();

router.post('/create', createNewChatController);
router.get('/list', getChatListController);
router.get('/:chatId/messages', getMessagesController);
router.get('/:chatId/exist', getIsChatExistController);
router.post('/:chatId/messages/mark-read', markMessagesAsReadController);
router.get('/:chatId/header', getChatHeaderController);

export default router;
