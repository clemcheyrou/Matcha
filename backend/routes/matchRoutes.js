import express from 'express';
import { discoverNewUsers, getLikeUsers, getMatchedUsers } from '../controllers/matchController.js';

const router = express.Router();

router.get('/discover', discoverNewUsers);
router.get('/matches', getMatchedUsers);
router.get('/like', getLikeUsers); 

export default router;
