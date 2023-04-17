import express, { Router } from 'express';
import {  register,
          login,
          logout,
          forgotPassword,
          resetPassword,
          getUserByUserName,
          getAllUsers,
          getUserById,
          updateUserById,
          deleteUserById,
          updateProfilePic
        } from '../controllers/userControllers';

import upload from '../config/multerConfig';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router: Router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.post('/logout', isAuthenticated, logout);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:resetPasswordToken', resetPassword);

router.get('/username/:username', getUserByUserName);

router.get('/all', getAllUsers);

router.get('/user/:id', getUserById);

router.put('/modify/:id', isAuthenticated, updateUserById);

router.put('/profile-pic/:id', isAuthenticated, upload.single('profilePic'), updateProfilePic);

router.delete('/delete/:id', isAuthenticated, deleteUserById); 

export default router;