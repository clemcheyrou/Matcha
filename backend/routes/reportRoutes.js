import express from 'express';
import { getReportUsers } from '../controllers/reportController.js';

const router = express.Router();

router.get("/", getReportUsers);

export default router;