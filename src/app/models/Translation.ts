import mongoose, { Schema } from "mongoose";

const Translation_Schema = new Schema({
    source_language: {
        type: String,
        required: true
    },
    target_language: {
        type: String,
        required: true
    },
    source_text: {
        type: String,

    },
    result: {
        type: String,
        required: true

    },
    model: { type: String, default: "facebook/m2m100_418M" },
    latency: Number,



}, { timestamps: true })

export default mongoose.models.Translation || mongoose.model("Translation", Translation_Schema)