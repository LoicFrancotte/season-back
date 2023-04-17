import Express, { Router } from 'express';

import {  toggleLikePost,
          toggleLikeComment,
          getAllLikes,
          getLikesByPostId,
          getLikesByCommentId,
        } from '../controllers/likesControllers';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router: Router = Express.Router();

router.patch('/post/like/:postId', isAuthenticated, toggleLikePost);

router.patch('/comment/like/:commentId', isAuthenticated, toggleLikeComment);

router.get('/all/likes', getAllLikes);

router.get('/all/likes/post/:postId', getLikesByPostId);

router.get('/all/likes/comment/:commentId', getLikesByCommentId);

export default router;