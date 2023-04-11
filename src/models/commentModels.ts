import mongoose, { Document } from "mongoose";

interface Comment {
  _id: string;
  userId: string;
  postId: string;
  text: string;
  likes: string[];
  date: Date;
}

type CommentDocument = Comment & Document;

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  text: {
    type: String,
    max: 500,
  },
  likes: {
    type: Array,
    default: [],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.model<CommentDocument>("Comment", commentSchema);

export default Comment;
