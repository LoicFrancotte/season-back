import Express, { Router } from 'express';

import {  createNewComment,
          getAllCommentByPostId,
          getAllCommentByUserId,
          updateCommentById,
          deleteCommentById
        } from '../controllers/commentControllers';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router: Router = Express.Router();

router.post('/comments/:postId', isAuthenticated, createNewComment);

router.get('/all/comments/:postId', getAllCommentByPostId);

router.get('/all/comments/user/:userId', getAllCommentByUserId);

router.put('/modify/comments/:id', isAuthenticated, updateCommentById);

router.delete('/deleted/comments/:id', isAuthenticated, deleteCommentById);

export default router;