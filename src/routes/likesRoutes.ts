import Express, { Router } from 'express';

import {  toggleLikePost,
          toggleLikeComment,
          getAllLikes,
          getLikesByPostId,
          getLikesByCommentId,
        } from '../controllers/likesControllers';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router: Router = Express.Router();

// PATCH /post/like/:postId
router.patch('/post/like/:postId', isAuthenticated, toggleLikePost);

// PATCH /comment/like/:commentId
router.patch('/comment/like/:commentId', isAuthenticated, toggleLikeComment);

// GET /all/likes
router.get('/all/likes', getAllLikes);

// GET /likes/:postId
router.get('/all/likes/post/:postId', getLikesByPostId);

// GET /likes/:commentId
router.get('/all/likes/comment/:commentId', getLikesByCommentId);

export default router;