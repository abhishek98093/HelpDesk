import express from 'express';
import { authenticate } from '../middleware/middleware.js';
import { getRecommendedUsers,getMyFriends, sendFriendRequest, acceptFriendRequest, getFriendRequests } from '../controllers/userController.js';
const router=express.Router();
router.use(authenticate)
router.get('/',getRecommendedUsers);
router.get('/friends',getMyFriends);
router.post('/friend-request/:id',sendFriendRequest);
router.put('/friend-request/:id/accept',acceptFriendRequest);
router.get('/friend-requests',getFriendRequests)

export default router;