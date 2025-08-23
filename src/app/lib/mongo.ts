import mongoose from "mongoose";
const uri = process.env.MONGODB_URI;

let cached = (global as any).mongoose;
export async function dbConnect() {
    if (cached) {
        return cached;
    }
    cached = await mongoose.connect(uri);
    (global as any)._mongoose = cached;
    return cached;
}

