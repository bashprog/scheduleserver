import mongoose from "mongoose";

export const Plane = mongoose.model("Plane", {
    // _id: mongoose.Schema.Types.ObjectId,
    name: String,
}, "Planes");