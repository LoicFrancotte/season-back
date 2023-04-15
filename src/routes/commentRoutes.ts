import Express, { Router } from 'express';

import {  createNewComment,
          getAllCommentByPostId,
          getAllCommentByUserId,
          updateCommentById,
          deleteCommentById
        } from '../controllers/commentControllers';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router: Router = Express.Router();

// POST /comments
router.post('/comments', isAuthenticated, createNewComment);

// GET /all/comments/:postId
router.get('/all/comments/:postId', getAllCommentByPostId);

// Get /all/comments/:userId
router.get('/all/comments/user/:userId', getAllCommentByUserId);

// PUT /comments/:id
router.put('/modify/comments/:id', isAuthenticated, updateCommentById);

// DELETE /comments/:id
router.delete('/deleted/comments/:id', isAuthenticated, deleteCommentById);

export default router;