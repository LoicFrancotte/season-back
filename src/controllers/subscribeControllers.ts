import { Request, Response } from 'express';

import User from '../models/userModels';

// Crée un nouvel abonnement (suivre un utilisateur)
export const followUser = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const currentUserId = req.body.currentUserId;

  if (!userId || !currentUserId) {
    return res.status(400).json({ message: "User ID and current user ID are required" });
  }

  try {
    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Vérifie si l'utilisateur actuel suit déjà l'utilisateur cible
    if (currentUser.followings && currentUser.followings.includes(userToFollow._id)) {
      return res.status(400).json({ message: "You are already following this user" });
    }

    // Ajoute l'utilisateur cible aux followings de l'utilisateur actuel
    if (currentUser.followings) {
      currentUser.followings.push(userToFollow._id);
    } else {
      currentUser.followings = [userToFollow._id];
    }
    await currentUser.save();

    // Ajoute l'utilisateur actuel aux followers de l'utilisateur cible
    if (userToFollow.followers) {
      userToFollow.followers.push(currentUser._id);
    } else {
      userToFollow.followers = [currentUser._id];
    }
    await userToFollow.save();

    res.status(200).json({ message: "Successfully followed user" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
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

// fonction qui permet de ne plus suivre un utilisateur
export const unfollowUser = async (req: Request, res: Response) => {
  const currentUserId = req.params.currentUserId;
  const userToUnfollowId = req.params.userToUnfollowId;

  try {
    const currentUser = await User.findById(currentUserId);
    const userToUnfollow = await User.findById(userToUnfollowId);

    if (!currentUser || !userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentUser.followings && currentUser.followings.includes(userToUnfollow._id)) {
      currentUser.followings = currentUser.followings.filter((id) => id == userToUnfollow._id);
      if (userToUnfollow.followers) {
        userToUnfollow.followers = userToUnfollow.followers.filter((id) => id == currentUser._id);
      }

      await currentUser.save();
      await userToUnfollow.save();

      res.status(200).json({ message: 'Unfollowed successfully' });
    } else {
      res.status(400).json({ message: 'User is not following the specified user' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while trying to unfollow user' });
  }
};