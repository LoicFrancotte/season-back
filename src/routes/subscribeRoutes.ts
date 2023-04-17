import Express, { Router } from 'express';

import {
          toggleFollowUser,
          getUserFollowersAndFollowings,
        } from '../controllers/subscribeControllers';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router: Router = Express.Router();

// PATCH /user/follow/:userId
router.patch('/user/follow/:userId', isAuthenticated, toggleFollowUser);

// GET /all/followers/:userId
router.get('/all/followers/:userId', getUserFollowersAndFollowings);

export default router;