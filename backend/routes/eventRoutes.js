import express from 'express';
import { createEventController, createUserEventController, getAllEventsController, getEventByIdController, getUserEventsController, createEventAndInviteUserController } from '../controllers/eventController.js';

const router = express.Router();

router.get('/', getAllEventsController);
router.get('/:id', getEventByIdController);
router.post('/', createEventController);
router.get('/:user_id', getUserEventsController);
router.post('/', createUserEventController);
router.post('/create-with-invite', createEventAndInviteUserController);

export default router;
