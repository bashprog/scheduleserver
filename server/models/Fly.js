import mongoose from "mongoose";
import { Comment } from "./Comment";

export const Fly = mongoose.model("Fly", {
    // _id: mongoose.Schema.Types.ObjectId,
    date: Date,
    duration: Number,
    author_id: String,
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}]
}, "Flys");