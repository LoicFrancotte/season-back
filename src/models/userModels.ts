import mongoose, { Document, Schema } from "mongoose";

interface User {
  _id: any;
  username: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
  profilePic?: string;
  followers?: Schema.Types.ObjectId[];
  followings?: Schema.Types.ObjectId[];
  posts?: Schema.Types.ObjectId[];
  comments?: Schema.Types.ObjectId[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

type UserDocument = User & Document;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    default: "",
  },
  lastname: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: "",
  },
  followers: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: [],
  },
  followings: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: [],
  },
  posts: {
    type: [Schema.Types.ObjectId],
    ref: 'Post',
    default: [],
  },
  comments: {
    type: [Schema.Types.ObjectId],
    ref: 'Comment',
    default: [],
  },
  resetPasswordToken: {
    type: String,
    default: "",
  },
  resetPasswordExpires: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;
