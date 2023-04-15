import Express, { Router } from 'express';

import {  followUser,
          getUserFollowersAndFollowings,
          unfollowUser
        } from '../controllers/subscribeControllers';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router: Router = Express.Router();

// POST /user/:userId/follow
router.post('/user/follow/:userId', isAuthenticated, followUser);

// GET /all/followers/:userId
router.get('/all/followers/:userId', getUserFollowersAndFollowings);

// DELETE /user/unfollow/:currentUserId/:userToUnfollowId
router.delete('/user/unfollow/:currentUserId/:userToUnfollowId', isAuthenticated, unfollowUser);

export default router;