import { Request, Response } from 'express';

import Post from '../models/postModels';
import Comment from '../models/commentModels';
import User from '../models/userModels';

// Crée un nouveau commentaire
export const createNewComment = async (req: Request, res: Response) => {
  const { userId, postId, text } = req.body;

  try {
    const newComment = new Comment({
      userId,
      postId,
      text,
    });

    const savedComment = await newComment.save();

    // Ajouter le commentaire au modèle User
    await User.updateOne({ _id: userId }, { $push: { comments: savedComment._id } });

    // Ajouter le commentaire au modèle Post
    await Post.updateOne({ _id: postId }, { $push: { comments: savedComment._id } });

    res.status(201).json(savedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Récupère tous les commentaires d'un post
export const getAllCommentByPostId = async (req: Request, res: Response) => {
  const postId = req.params.postId;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.find({ postId: postId });

    return res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Récupère tous les commentaires d'un utilisateur
export const getAllCommentByUserId = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comments = await Comment.find({ userId: userId });

    return res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Met à jour un commentaire par son ID
export const updateCommentById = async (req: Request, res: Response) => {
  const commentId = req.params.id;
  const { text } = req.body;

  if (!commentId) {
    return res.status(400).json({ message: "Comment ID is required" });
  }

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ message: "Text is required" });
  }

  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { text: text.trim() },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json(updatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Supprime un commentaire par son ID
export const deleteCommentById = async (req: Request, res: Response) => {
  const commentId = req.params.id;

  if (!commentId) {
    return res.status(400).json({ message: "Comment ID is required" });
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Supprimez le commentaire de la collection Comment
    await Comment.findByIdAndDelete(commentId);

    // Trouvez l'utilisateur associé au commentaire et mettez à jour son tableau de commentaires
    const user = await User.findById(comment.userId);
    if (user) {
      user.comments = user.comments?.filter(id => id.toString() !== commentId);
      await user.save();
    }

    // Trouvez le post associé au commentaire et mettez à jour son tableau de commentaires
    const post = await Post.findById(comment.postId);
    if (post) {
      post.comments = post.comments.filter(id => id.toString() !== commentId);
      await post.save();
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};