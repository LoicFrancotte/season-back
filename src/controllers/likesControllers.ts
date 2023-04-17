import { Request, Response } from 'express';
import { Types } from 'mongoose';

import Post from '../models/postModels';
import Comment from '../models/commentModels';

// Fonction qui permet de liker un post
export const toggleLikePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId);
    const userId = req.user.id;

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ message: "Invalid user ID" });
    }

    if (post.likes.includes(userId)) {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json({ message: "Unliked" });
    } else {
      await post.updateOne({ $push: { likes: new Types.ObjectId(userId) } });
      res.status(200).json({ message: "Liked" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// Fonction qui permet de liker un commentaire
export const toggleLikeComment = async (req: Request, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    const userId = req.user.id;

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ message: "Invalid user ID" });
    }

    if (comment.likes.includes(userId)) {
      await comment.updateOne({ $pull: { likes: userId } });
      res.status(200).json({ message: "Unliked" });
    } else {
      await comment.updateOne({ $push: { likes: new Types.ObjectId(userId) } });
      res.status(200).json({ message: "Liked" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// Fonction qui permet de récupérer tous les likes
export const getAllLikes = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find();
    const comments = await Comment.find();

    res.status(200).json({ posts, comments });
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

    res.status(200).json({ post });
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

    res.status(200).json({ comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}