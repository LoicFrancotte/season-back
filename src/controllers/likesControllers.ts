import { Request, Response } from 'express';
import mongoose from "mongoose";

import Post from '../models/postModels';
import User from '../models/userModels';
import Comment from '../models/commentModels';

// Fonction qui permet d'aimer un post
export const createNewLikePost = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const postId = req.params.postId;

  try {
    // Trouver le post par son ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Ajouter l'ID de l'utilisateur au tableau des likes du post
    post.likes.push(userId);
    await post.save();

    // Trouver l'utilisateur par son ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ajouter l'ID du post au tableau des postLikes de l'utilisateur
    if (user.postLikes) {
      user.postLikes.push(postId);
    } else {
      user.postLikes = [postId];
    }
    await user.save();

    res.status(200).json({ message: 'Post liked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error liking the post', error: (error as Error).message });
  }
}

// Fonction qui permet d'aimer un commentaire
export const createNewLikeComment = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const commentId = req.params.commentId;

  if (!userId || !commentId) {
    return res.status(400).json({ message: "User ID and Comment ID are required" });
  }

  try {
    const comment = await Comment.findById(commentId);
    const user = await User.findById(userId);

    if (!comment || !user) {
      return res.status(404).json({ message: "User or Comment not found" });
    }

    // Ajoute l'ID de l'utilisateur à la liste des likes du commentaire
    comment.likes.push(userId);
    await comment.save();

    // Ajoute l'ID du commentaire aimé au tableau des commentLikes de l'utilisateur
    if (!user.commentLikes) {
      user.commentLikes = [];
    }
    user.commentLikes.push(commentId);
    await user.save();

    res.status(200).json({ message: "Comment liked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Fonction qui permet de récupérer tous les likes
export const getAllLikes = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find();
    const comments = await Comment.find();

    const likes = [...posts, ...comments];

    res.status(200).json(likes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// Fonction qui permet de récupérer tous les likes d'un post
export const getLikesByPostId = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post.likes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// Fonction qui permet de récupérer tous les likes d'un utilisateur
export const getLikesByUserId = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const postLikes = user.postLikes || [];
    const commentLikes = user.commentLikes || [];

    res.status(200).json({ postLikes, commentLikes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// Fonction qui permet de récupérer tous les likes d'un commentaire
export const getLikesByCommentId = async (req: Request, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json(comment.likes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// Supprime un like par son ID
export const deleteLikeById = async (req: Request, res: Response) => {
  const { postId, userId, commentId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (postId) {
      const post = await Post.findById(postId);

      if (post) {
        const likeIndex = post.likes.indexOf(userId);
        if (likeIndex !== -1) {
          post.likes.splice(likeIndex, 1);
          await post.save();
        }
      }

      if (user.postLikes) {
        const postLikeIndex = user.postLikes.indexOf(postId);
        if (postLikeIndex !== -1) {
          user.postLikes.splice(postLikeIndex, 1);
        }
      }
    }

    if (commentId) {
      const comment = await Comment.findById(commentId);

      if (comment) {
        const likeIndex = comment.likes.indexOf(userId);
        if (likeIndex !== -1) {
          comment.likes.splice(likeIndex, 1);
          await comment.save();
        }
      }

      if (user.commentLikes) {
        const commentLikeIndex = user.commentLikes.indexOf(commentId);
        if (commentLikeIndex !== -1) {
          user.commentLikes.splice(commentLikeIndex, 1);
        }
      }
    }

    // Sauvegarde les modifications apportées à l'utilisateur
    await user.save();

    res.status(200).json({ message: "Like successfully removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
