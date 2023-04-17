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

router.post('/posts', isAuthenticated, createNewPost);

router.get('/all/posts', getAllPosts);

router.get('/posts/:id', getPostById);

router.get('/posts/users/:userId', getPostsByUserId);

router.put('/modify/posts/:id', isAuthenticated, updatePostById);

router.delete('/delete/posts/:id', isAuthenticated, deletePostById);

export default router;