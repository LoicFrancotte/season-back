import mongoose, { Document } from "mongoose";

interface Post {
  _id: string;
  userId: string;
  text: string;
  img: string;
  video: string;
  likes: string[];
  comments: string[];
  date: Date;
}

type PostDocument = Post & Document;

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    max: 500,
  },
  img: {
    type: String,
  },
  video: {
    type: String,
  },
  likes: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  },
  comments: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    default: [],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model<PostDocument>("Post", postSchema);

export default Post;