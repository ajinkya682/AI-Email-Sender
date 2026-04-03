import express from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect); // All chat routes are protected

router.get('/conversations', getConversations);
router.get('/conversations/:id', getMessages);
router.post('/', sendMessage);

export default router;
