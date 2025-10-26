import { Schema, model, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IUser } from "../interface/user.interface";

// 2. Create the schema
const userSchema = new Schema<IUser>({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  name: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: Buffer, required: true }, // Use Buffer for hashed password
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },

});

// 3. Create and export the model
export const User = model<IUser>("User", userSchema);