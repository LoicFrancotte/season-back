import Express, { Router } from 'express';

import {
          toggleFollowUser,
          getUserFollowersAndFollowings,
        } from '../controllers/subscribeControllers';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router: Router = Express.Router();

router.patch('/user/follow/:userId', isAuthenticated, toggleFollowUser);

router.get('/all/followers/:userId', getUserFollowersAndFollowings);

export default router;