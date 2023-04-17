import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';

import Post from '../models/postModels';
import User from '../models/userModels';

// Create a new post
export const createNewPost = async (req: Request, res: Response) => {
  try {
    const { text, img, video } = req.body;
    const userId = req.user.id;

    const newPost = new Post({
      userId,
      text,
      img,
      video,
    });

    const savedPost = await newPost.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.posts) {
      user.posts = [];
    }
    user.posts.push(savedPost._id);

    await user.save();

    res.status(201).json({ savedPost });
  } catch (error: any) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Get all posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find().populate('userId', 'username');

    res.status(200).json({ posts });
  } catch (error: any) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Get a post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).populate('userId', 'username');

    res.status(200).json({ post });
  } catch (error: any) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Get all posts by user ID
export const getPostsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postIds = user.posts;
    const posts = await Post.find({ _id: { $in: postIds } });

    res.json({ posts });
  } catch (error: any) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Update a post by ID
export const updatePostById = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const { text, img, video } = req.body;
    const userId = req.user.id;

    const post = await Post.findOne({ _id: postId, userId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    post.text = text ?? post.text;
    post.img = img ?? post.img;
    post.video = video ?? post.video;

    const updatedPost = await post.save();

    await User.updateOne({ _id: userId, posts: postId }, { $set: { "posts.$": updatedPost._id } });

    res.json({ post: updatedPost });
  } catch (error: any) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Delete a post by ID
export const deletePostById = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findOne({ _id: postId, userId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    await Post.deleteOne({ _id: postId });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.posts) {
      user.posts = user.posts.filter((postId: ObjectId) => postId.toString() !== post._id.toString());
      await user.save();
    }

    res.json({ message: 'Post deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};