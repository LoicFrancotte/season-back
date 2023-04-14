import { Request, Response } from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import Mailgun from 'mailgun.js';
import formData from 'form-data';
import crypto from 'crypto';

import User from '../models/userModels';

// Constante pour le secret JWT
const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    console.error("Requête reçue:", req.body); // Ajouté

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUserByEmail = await User.findOne({ email });
    console.error("Utilisateur existant par e-mail:", existingUserByEmail); // Ajouté

    if (existingUserByEmail) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const existingUserByUsername = await User.findOne({ username });
    console.error("Utilisateur existant par nom d'utilisateur:", existingUserByUsername); // Ajouté

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
    console.error("Mot de passe haché:", hashedPassword); // Ajouté

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    console.error("Utilisateur enregistré:", savedUser); // Ajouté

    const token = jwt.sign({ id: savedUser._id }, JWT_SECRET!, {
      expiresIn: '1d',
    });

    res.status(201).json({ message: 'New user created succesfully', token });
  } catch (error) {
    console.error("Erreur du backend:", error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


// Connexion d'un utilisateur existant
export const login = async (req: Request, res: Response) => {
  try {
    // Récupération des données de connexion à partir de la requête
    const { username, password } = req.body;

    // Recherche de l'utilisateur dans la base de données
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Vérification du mot de passe
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Création du token JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET!, {
      expiresIn: '1d',
    });

    // Envoi de la réponse avec le token JWT
    res.status(200).json({ message: 'User Logged In', token });
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Déconnexion d'un utilisateur
export const logout = async (req: Request, res: Response) => {
  try {
    // Récupération de l'utilisateur à partir de la requête
    const user = req.user;

    console.log('User:', user); // Ajoutez ce journal de débogage

    // Vérifie si l'utilisateur est connecté
    if (!user) {
      return res.status(400).json({ message: 'User not logged in' });
    }

    // Envoi de la réponse avec un message de succès
    res.status(200).json({ message: 'User Logged Out' });
  } catch (error) {
    console.error('Error:', error); // Ajoutez ce journal de débogage
    // Gestion des erreurs
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Importation de la bibliothèque Mailgun et création d'un client avec les informations d'authentification
const mailgun = new Mailgun(formData);
const client = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
  url: 'https://api.eu.mailgun.net'
});

// Fonction pour la demande de réinitialisation de mot de passe
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    // Récupération de l'adresse email de l'utilisateur depuis la requête
    const { email } = req.body;

    // Vérifie si l'e-mail est présent dans la requête
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Recherche de l'utilisateur dans la base de données en utilisant son adresse email
    const user = await User.findOne({ email: req.body.email });
    console.log('user:', user);

    // Si aucun utilisateur n'est trouvé avec cette adresse email, renvoyer une réponse avec un message d'erreur
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Génération d'un token de réinitialisation de mot de passe aléatoire de 20 caractères en hexadécimal
    const token = crypto.randomBytes(20).toString('hex');
    
    // Enregistrement du token de réinitialisation de mot de passe et sa durée de validité (1 heure) dans la base de données pour cet utilisateur
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Construction des URL de réinitialisation de mot de passe pour les environnements de production et de développement
    const resetUrl = `http://${process.env.NAME_DOMAIN}/reset-password/${user._id}/${token}`;
    const resetUrl2 = `${process.env.LOCAL_URL}/reset-password/${user._id}/${token}`;
    console.log(resetUrl);
    console.log(resetUrl2); 
    
    // Création d'un objet de message pour l'email avec des informations telles que l'adresse email de l'utilisateur, l'objet de l'email, le texte et le HTML du corps de l'email, et l'URL de désabonnement
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

    // Envoie un message en utilisant la bibliothèque Mailgun pour envoyer un e-mail de réinitialisation de mot de passe.
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
    // Gestion des erreurs
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Fonction pour la réinitialisation de mot de passe
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const resetPasswordToken = req.params.resetPasswordToken;
    const { newPassword, confirmNewPassword } = req.body;

    // Vérifier que les nouveaux mots de passe correspondent et respectent les exigences de validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (newPassword !== confirmNewPassword || !passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          'Passwords must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and match with ConfirmNewPassword field.',
      });
    }

    // Vérifier que le token de réinitialisation de mot de passe est valide
    const user = await User.findOne({ resetPasswordToken });
    if (!user) {
      return res.status(400).json({ message: 'Invalid reset password token' });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await argon2.hash(newPassword);

    // Mettre à jour le mot de passe de l'utilisateur dans la base de données
    user.password = hashedPassword;
    user.resetPasswordToken = '';
    await user.save();

    // Générer un nouveau token JWT pour l'utilisateur
    const token = jwt.sign({ id: user._id }, JWT_SECRET!, {
      expiresIn: '1d',
    });

    // Envoyer une réponse avec le token JWT et un message de confirmation
    res.status(200).json({ message: 'Password reset successfully', token });
  } catch (error) {
    // Gérer les erreurs
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Récupération de l'utilisateur par son username
export const getUserByUserName = async (req: Request, res: Response) => {
  try {
    // Récupération du username de l'utilisateur à partir de la requête
    const { username } = req.params;

    // Recherche de l'utilisateur dans la base de données
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Envoi de la réponse avec les informations de l'utilisateur
    res.status(200).json(user);
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Récupération de tous les utilisateurs
export const getAllUsers = async (_: Request, res: Response) => {
  try {
    // Recherche de tous les utilisateurs dans la base de données
    const users = await User.find({});

    // Envoi de la réponse avec la liste des utilisateurs
    res.status(200).json(users);
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Récupération d'un utilisateur par son ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    // Récupération de l'ID de l'utilisateur à partir de la requête
    const { id } = req.params;

    // Recherche de l'utilisateur dans la base de données
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Envoi de la réponse avec les données de l'utilisateur
    res.status(200).json(user);
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Mise à jour d'un utilisateur par son ID
export const updateUserById = async (req: Request, res: Response) => {
  try {
    // Récupération de l'ID de l'utilisateur à partir de la requête
    const { id } = req.params;

    // Récupération des données de l'utilisateur à partir de la requête
    const { username, name, lastname, email, password, confirmNewPassword } = req.body;

    // Recherche de l'utilisateur dans la base de données
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mise à jour des données de l'utilisateur
    if (username) user.username = username;
    if (name) user.name = name;
    if (lastname) user.lastname = lastname;
    if (email) user.email = email;

    // Si un nouveau mot de passe est fourni, vérifier qu'il correspond au mot de passe confirmé,
    // le hacher et le mettre à jour
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

    // Sauvegarde des modifications dans la base de données
    const updatedUser = await user.save();

    // Envoi de la réponse avec les données de l'utilisateur mis à jour
    res.status(200).json(updatedUser);
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Suppression d'un utilisateur par son ID
export const deleteUserById = async (req: Request, res: Response) => {
  try {
    // Récupération de l'ID de l'utilisateur à partir de la requête
    const { id } = req.params;

    // Recherche et suppression de l'utilisateur dans la base de données
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Envoi de la réponse avec un message de confirmation
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({ message: 'Something went wrong' });
  }
};

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

    // Met à jour la photo de profil de l'utilisateur en tant que chaîne base64
    user.profilePic = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    await user.save();

    res.json({ message: 'Photo de profil mise à jour avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};