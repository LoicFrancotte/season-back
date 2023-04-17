import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import path from 'path';
import argon2 from 'argon2';

import User from './models/userModels';
import Post from './models/postModels';
import Comment from './models/commentModels';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Clear the database
const clearDatabase = async () => {
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});
};

// Create fake user
const createFakeUser = async () => {
  const hashedPassword = await argon2.hash(faker.internet.password());

  return new User({
    username: faker.internet.userName(),
    name: faker.name.firstName(),
    lastname: faker.name.lastName(),
    email: faker.internet.email(),
    password: hashedPassword,
    profilePic: faker.image.avatar(),
  });
};

// Create fake post
const createFakePost = (userId: string) => {
  return new Post({
    userId,
    text: faker.lorem.sentence(),
    img: faker.datatype.boolean() ? faker.image.imageUrl() : '',
    video: '',
    likes: [],
    comments: [],
    date: faker.date.past(),
  });
};

// Create fake comment
const createFakeComment = (userId: string, postId: string) => {
  return new Comment({
    userId,
    postId,
    text: faker.lorem.sentence(),
    likes: [],
    date: faker.date.past(),
  });
};

// Seed the database
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_URL!);
    console.log('🌱 Connected to MongoDB');

    await clearDatabase();
    console.log('🌱 Database cleared');

    const fakeUsersPromises = Array.from({ length: 500 }, () => createFakeUser());
    const fakeUsers = await Promise.all(fakeUsersPromises);
    const createdUsers = await User.insertMany(fakeUsers);
    console.log('🌱 Fake users added');

    const fakePosts = createdUsers.flatMap((user) => {
      const numberOfPosts = Math.floor(Math.random() * 6);
      return Array.from({ length: numberOfPosts }, () => createFakePost(user._id));
    });

    await Post.insertMany(fakePosts);
    console.log('🌱 Fake posts added');

    await Promise.all(
      fakePosts.map((post) => {
        return User.findByIdAndUpdate(post.userId, { $push: { posts: post._id } });
      })
    );

    const fakeComments = createdUsers.flatMap((user) => {
      const numberOfComments = Math.floor(Math.random() * 6) + 5;
      return Array.from({ length: numberOfComments }, () => {
        const randomPost = fakePosts[Math.floor(Math.random() * fakePosts.length)];
        return createFakeComment(user._id, randomPost._id);
      });
    });

    await Comment.insertMany(fakeComments);
    console.log('🌱 Fake comments added');

    await Promise.all(
      fakeComments.map((comment) => {
        return Promise.all([
          User.findByIdAndUpdate(comment.userId, { $push: { comments: comment._id } }),
          Post.findByIdAndUpdate(comment.postId, { $push: { comments: comment._id } }),
        ]);
      })
    );

    const addFakeLikes = async (entityId: string, entityType: 'post' | 'comment', numLikes: number, users: User[]) => {
      const likes = users.slice(0, numLikes).map((user) => user._id);
      if (entityType === 'post') {
        await Post.findByIdAndUpdate(entityId, { $push: { likes: { $each: likes } } });
      } else if (entityType === 'comment') {
        await Comment.findByIdAndUpdate(entityId, { $push: { likes: { $each: likes } } });
      }
    };

    for (const post of fakePosts) {
      const numLikes = Math.floor(Math.random() * 11);
      const shuffledUsers = createdUsers.sort(() => 0.5 - Math.random());
      await addFakeLikes(post._id, 'post', numLikes, shuffledUsers);
    }

    for (const comment of fakeComments) {
      const numLikes = Math.floor(Math.random() * 11);
      const shuffledUsers = createdUsers.sort(() => 0.5 - Math.random());
      await addFakeLikes(comment._id, 'comment', numLikes, shuffledUsers);
    }

    console.log('🌱 Fake likes added');

    const addRandomFollowings = async (user: User, users: User[], maxFollowings: number) => {
      const numFollowings = Math.floor(Math.random() * 10) + 1;
      const shuffledUsers = users.filter((u) => u._id !== user._id).sort(() => 0.5 - Math.random());
      const followings = shuffledUsers.slice(0, numFollowings).map((u) => u._id);

      await User.findByIdAndUpdate(user._id, { $push: { followings: { $each: followings } } });

      await Promise.all(
        followings.map((followingId) => {
          return User.findByIdAndUpdate(followingId, { $push: { followers: user._id } });
        })
      );
    };

    for (const user of createdUsers) {
      await addRandomFollowings(user, createdUsers, 10);
    }

    console.log('🌱 Fake followings and followers added');

    console.log('🌱 Database successfully populated!');
    mongoose.connection.close();

  } catch (error) {
    console.error('Error when populating the database:', error);
    mongoose.connection.close();
  }
};

seedDatabase();
