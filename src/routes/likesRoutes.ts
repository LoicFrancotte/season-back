import Express, { Router } from 'express';

import {  createNewLikePost,
          createNewLikeComment,
          getAllLikes,
          getLikesByPostId,
          getLikesByUserId,
          getLikesByCommentId,
          deleteLikeById
        } from '../controllers/likesControllers';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router: Router = Express.Router();

// POST /likes/post/:postId
router.post('/likes/post/:postId', isAuthenticated, createNewLikePost);

// POST /likes/comment/:commentId
router.post('/likes/comment/:commentId', isAuthenticated, createNewLikeComment);

// GET /all/likes
router.get('/all/likes', getAllLikes);

// GET /likes/:postId
router.get('/likes/post/:postId', getLikesByPostId);

// GET /likes/:userId
router.get('/likes/user/:userId', getLikesByUserId);

// GET /likes/:commentId
router.get('/likes/comment/:commentId', getLikesByCommentId);

// DELETE /likes/:id
router.delete('/likes/deleted/:id', isAuthenticated, deleteLikeById);

export default router;