import express from 'express';
import { createLocationForUserController, getAllUserLocationsController, getUserLocationController, updateLocationForUserController } from '../controllers/userController.js';

const router = express.Router();

router.post('/', createLocationForUserController);
router.get('/', getAllUserLocationsController);
router.put('/', updateLocationForUserController);
router.get('/user', getUserLocationController);
	
export default router;