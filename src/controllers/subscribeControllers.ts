import { Request, Response } from 'express';
import { Types } from 'mongoose';

import User from '../models/userModels';

// Follow / unfollow un utilisateur
export const toggleFollowUser = async (req: Request, res: Response) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUserId = req.user.id;

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!Types.ObjectId.isValid(currentUserId)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToFollow.followers?.includes(currentUserId)) {
      await userToFollow.updateOne({ $pull: { followers: currentUserId } });
      await currentUser.updateOne({ $pull: { followings: req.params.userId } });
      res.status(200).json({ message: 'Unfollowed' });
    } else {
      await userToFollow.updateOne({ $push: { followers: new Types.ObjectId(currentUserId) } });
      await currentUser.updateOne({ $push: { followings: new Types.ObjectId(req.params.userId) } });
      res.status(200).json({ message: 'Followed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error following user', error });
  }
};

// Récupère tous les followers / followings d'un utilisateur
export const getUserFollowersAndFollowings = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select('followers followings');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followers = user.followers || [];
    const followings = user.followings || [];

    res.status(200).json({ followers, followings });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user followers and followings', error });
  }
};