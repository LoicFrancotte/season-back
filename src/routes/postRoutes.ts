import express, { Router } from 'express';

import {  createNewPost,
          getAllPosts,
          getPostById,
          getPostsByUserId,
          updatePostById,
          deletePostById
        } from '../controllers/postControllers';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router: Router = express.Router();

// POST /posts
router.post('/posts', isAuthenticated, createNewPost);

// GET /posts
router.get('/all/posts', getAllPosts);

// GET /posts/:id
router.get('/posts/:id', getPostById);

// GET /users/:userId/posts
router.get('/posts/users/:userId', getPostsByUserId);

// PUT /posts/:id
router.put('/posts/:id', isAuthenticated, updatePostById);

// DELETE /posts/:id
router.delete('/posts/:id', isAuthenticated, deletePostById);

export default router;