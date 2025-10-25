import { Document } from "mongoose";

// 1. Define the interface for User document
export interface IUser extends Document {
  id: string;
  username: string;
  email: string;
  password: Buffer; // bcrypt hash stored as Buffer
  created_at: Date;
  updated_at: Date;
}