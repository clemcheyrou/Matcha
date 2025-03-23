import express from 'express';
import { getBlockedUsers } from '../controllers/blockController.js';

const router = express.Router();

router.get("/", getBlockedUsers);

export default router;