import express from 'express';
import { createLocationForUserController, getAllUserLocationsController } from '../controllers/userController.js';

const router = express.Router();

router.post('/', createLocationForUserController);
router.get('/', getAllUserLocationsController);

export default router;