import mongoose from "mongoose";
import { Comment } from "./Comment";
import { Plane } from "./Plane";

export const Fly = mongoose.model("Fly", {
    // _id: mongoose.Schema.Types.ObjectId,
    date: Date,
    duration: Number,
    author_id: String,
    plane_id: String,
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
    plane: [{type: mongoose.Schema.Types.ObjectId, ref: "Plane"}]
}, "Flys");