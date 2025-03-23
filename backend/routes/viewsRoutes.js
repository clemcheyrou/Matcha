import express from 'express';
import { getProfileViewsController } from '../controllers/viewsController.js';

const router = express.Router();

router.get('/', getProfileViewsController);

export default router;