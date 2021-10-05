import mongoose from "mongoose";
import { Fly } from "./Fly";

export const User = mongoose.model("User", {
    // _id: mongoose.Schema.Types.ObjectId,
    email: String,
    name: String, 
    password: String, 
    token: String,
    role: String,
    flys: [{type: mongoose.Schema.Types.ObjectId, ref: "Fly"}]
}, "Users");