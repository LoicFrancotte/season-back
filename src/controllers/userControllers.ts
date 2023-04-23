import { Request, Response } from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import Mailgun from 'mailgun.js';
import formData from 'form-data';
import crypto from 'crypto';

import User from '../models/userModels';

// Constances for JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Create a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ message: 'User with this username already exists' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number.',
      });
    }

    const hashedPassword = await argon2.hash(password);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const token = jwt.sign({ id: savedUser._id }, JWT_SECRET!, {
      expiresIn: '1d',
    });

    res.status(201).json({ message: 'New user created succesfully', token, User: savedUser });
  } catch (error) {
    console.error("Erreur du backend:", error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Login a user
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET!, {
      expiresIn: '1d',
    });

    res.status(200).json({ message: 'User Logged In', token });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Logout a user
export const logout = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(400).json({ message: 'User not logged in' });
    }

    res.status(200).json({ message: 'User Logged Out' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Import Mailgun API
const mailgun = new Mailgun(formData);
const client = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
  url: 'https://api.eu.mailgun.net'
});

// Forgot password function (send email)
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(20).toString('hex');
    
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const resetUrl = `http://${process.env.BACKEND_URL}/reset-password/${user._id}/${token}`;
    const resetUrl2 = `${process.env.LOCAL_URL}/reset-password/${user._id}/${token}`;
    console.log('resetUrl:', resetUrl);
    console.log('resetUrl2:', resetUrl2);
    
    const msg = {
      from: 'Season <no-reply@loic.francotte.me>',
      to: user.email,
      subject: 'Password Reset Request',
      text: `Bonjour,\n\nVeuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe :\n${resetUrl}\n\nCe lien expirera dans 1 heure.\n\nSi vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer ce message.\n\nCordialement,\n\nL'équipe Season`,
      'h:List-Unsubscribe': `<mailto:no-reply@loic.francotte.me>`,
      html: ` <html>
                <body>
                  <p>Bonjour,</p>
                  <p>Veuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                  <p><a href="${resetUrl}">Cliquez ici</a></p>
                  <p>Ce lien expirera dans 1 heure.</p>
                  <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer ce message.</p>
                  <p>Cordialement,</p>
                  <p>L'équipe Season</p>
                  <p>Si vous ne souhaitez plus recevoir d'e-mails de notre part, <a href="mailto:no-reply@loic.francotte.me?subject=Désabonnement&body=Je souhaite me désabonner de vos e-mails">cliquez ici</a> pour vous désabonner.</p>
                </body>
              </html> `
    };

    await client.messages.create(process.env.MAILGUN_DOMAIN!, msg)
    .then(msg => {
      console.log(msg);
      res.status(200).json({ message: 'Password reset email sent' });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Internal server error' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Reset password function
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const resetPasswordToken = req.params.resetPasswordToken;
    const { newPassword, confirmNewPassword } = req.body;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (newPassword !== confirmNewPassword || !passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          'Passwords must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and match with ConfirmNewPassword field.',
      });
    }

    const user = await User.findOne({ resetPasswordToken });
    if (!user) {
      return res.status(400).json({ message: 'Invalid reset password token' });
    }

    const hashedPassword = await argon2.hash(newPassword);

    user.password = hashedPassword;
    user.resetPasswordToken = '';
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET!, {
      expiresIn: '1d',
    });

    res.status(200).json({ message: 'Password reset successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get user by username
export const getUserByUserName = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all users
export const getAllUsers = async (_: Request, res: Response) => {
  try {
    const users = await User.find({});

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Update user by ID
export const updateUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { username, name, lastname, email, password, confirmNewPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (name) user.name = name;
    if (lastname) user.lastname = lastname;
    if (email) user.email = email;

    if (password) {
      if (password !== confirmNewPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          message:
            'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number.',
        });
      }
      user.password = await argon2.hash(password);
    }

    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Delete user by ID
export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Update profile picture
export const updateProfilePic = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Veuillez sélectionner une photo de profil' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    user.profilePic = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    await user.save();

    res.json({ message: 'Photo de profil mise à jour avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};