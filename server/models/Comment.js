import mongoose from "mongoose";

export const Comment = mongoose.model("Comment", {
    // _id: mongoose.Schema.Types.ObjectId,
    comment: String,
    author_id: String,
    fly_id: String 
}, "Comments");