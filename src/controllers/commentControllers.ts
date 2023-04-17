import { Request, Response } from 'express';

import Post from '../models/postModels';
import Comment from '../models/commentModels';
import User from '../models/userModels';

// Create a new comment
export const createNewComment = async (req: Request, res: Response) => {
  const text = req.body.text;
  const postId = req.params.postId;
  const userId = req.user.id;

  try {
    const newComment = new Comment({
      text,
      postId,
      userId,
    });

    const savedComment = await newComment.save();

    await User.updateOne({ _id: userId }, { $push: { comments: savedComment._id } });

    await Post.updateOne({ _id: postId }, { $push: { comments: savedComment._id } });

    res.status(201).json(savedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all comments
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

// Get all comments by user ID
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

// Update a comment by ID
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

// Delete a comment by ID
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

    await Comment.findByIdAndDelete(commentId);

    const user = await User.findById(comment.userId);
    if (user) {
      user.comments = user.comments?.filter(id => id.toString() !== commentId);
      await user.save();
    }

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