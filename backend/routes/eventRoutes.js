import express from 'express';
import { createEventController, createUserEventController, getAllEventsController, getEventByIdController, getUserEventsController, createEventAndInviteUserController, getInvitationsController } from '../controllers/eventController.js';

const router = express.Router();

router.get('/', getAllEventsController);
router.get('/user', getUserEventsController);
router.get('/invitations', getInvitationsController);
router.get('/:id', getEventByIdController);
router.post('/', createEventController);
router.post('/', createUserEventController);
router.post('/create-with-invite', createEventAndInviteUserController);

export default router;
