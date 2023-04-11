import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';

import Post from '../models/postModels';
import User from '../models/userModels';

// Création d'un nouveau post
export const createNewPost = async (req: Request, res: Response) => {
  try {
    // Récupération des données du post à partir de la requête
    const { text, img, video } = req.body;
    const userId = req.user.id;

    // Création d'un nouvel objet Post
    const newPost = new Post({
      userId,
      text,
      img,
      video,
    });

    // Sauvegarde du post dans la base de données
    const savedPost = await newPost.save();

    // Mise à jour de l'utilisateur en ajoutant l'ID du post créé
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.posts) {
      user.posts = [];
    }
    user.posts.push(savedPost._id);

    await user.save();

    // Envoi de la réponse avec le post créé
    res.status(201).json({ savedPost });
  } catch (error: any) {
    // Gestion des erreurs
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Récupération de tous les posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    // Récupération de tous les posts
    const posts = await Post.find().populate('userId', 'username');

    // Envoi de la réponse avec tous les posts
    res.status(200).json({ posts });
  } catch (error: any) {
    // Gestion des erreurs
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Récupération d'un post par son ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    // Récupération de l'ID du post à partir de la requête
    const { id } = req.params;

    // Récupération du post dans la base de données
    const post = await Post.findById(id).populate('userId', 'username');

    // Envoi de la réponse avec le post
    res.status(200).json({ post });
  } catch (error: any) {
    // Gestion des erreurs
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Récupération de tous les posts d'un utilisateur
export const getPostsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    // Vérification que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Récupération des posts de l'utilisateur à partir de leur ID
    const postIds = user.posts;
    const posts = await Post.find({ _id: { $in: postIds } });

    // Envoi de la réponse avec les posts de l'utilisateur
    res.json({ posts });
  } catch (error: any) {
    // Gestion des erreurs
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Mise à jour d'un post par son ID
export const updatePostById = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const { text, img, video } = req.body;
    const userId = req.user.id;

    // Vérification que le post existe et appartient à l'utilisateur
    const post = await Post.findOne({ _id: postId, userId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    // Mise à jour des propriétés du post
    post.text = text ?? post.text;
    post.img = img ?? post.img;
    post.video = video ?? post.video;

    // Sauvegarde du post mis à jour dans la base de données
    const updatedPost = await post.save();

    // Mise à jour de l'utilisateur en mettant à jour l'ID du post modifié
    await User.updateOne({ _id: userId, posts: postId }, { $set: { "posts.$": updatedPost._id } });

    // Envoi de la réponse avec le post mis à jour
    res.json({ post: updatedPost });
  } catch (error: any) {
    // Gestion des erreurs
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Suppression d'un post par son ID
export const deletePostById = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Vérification que le post existe et appartient à l'utilisateur
    const post = await Post.findOne({ _id: postId, userId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    // Suppression du post dans la base de données
    await Post.deleteOne({ _id: postId });

    // Mise à jour de l'utilisateur en supprimant l'ID du post supprimé
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.posts) {
      user.posts = user.posts.filter((postId: ObjectId) => postId.toString() !== post._id.toString());
      await user.save();
    }

    // Envoi de la réponse avec le message de confirmation
    res.json({ message: 'Post deleted' });
  } catch (error: any) {
    // Gestion des erreurs
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};