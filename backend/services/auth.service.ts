import bcrypt from "bcryptjs";
import { Document } from "mongoose";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";

// ------------ User Interface ------------
interface IUser extends Document {
  username: string;
  email: string;
  password: string;
}

// ------------ Register User ------------
const register = async (details: {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}): Promise<{ success: boolean; message: string }> => {
  const { username, email, password, confirm_password } = details;

  if (password !== confirm_password) {
    return { success: false, message: "Passwords do not match" };
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return { success: false, message: "Username or email already exists" };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User<IUser>({
    username,
    email,
    password: hashedPassword,
  } as IUser);

  await newUser.save();
  return { success: true, message: "Signup successful!" };
};

// ------------ Login User ------------
const login = async (details: {
  email: string;
  password: string;
}): Promise<
  | { success: true; message: string; username: string; email: string }
  | { success: false; message: string }
> => {
  const { email, password } = details;

  const user = await User.findOne({ email });
  if (!user) {
    return { success: false, message: "No User Found" };
  }

  const isMatch = await bcrypt.compare(password, user.password.toString());
  if (!isMatch) {
    return { success: false, message: "Invalid email or password" };
  }

  return {
    success: true,
    message: "Login successful",
    username: user.username,
    email: user.email,
  };
};

// ------------ Generate API Key for User ------------
const generateAPI = async (username: string): Promise<
  | { success: true; token: string }
  | { success: false; message: string }
> => {
  const user = username;

  if (!process.env.SECRET_KEY) {
    return {
      success: false,
      message: "Error in generating the API Key for the RTQI Score."
    };
  }

  const token = jwt.sign(
    { username: user },
    process.env.SECRET_KEY,
  );

  return {
    success: true,
    token: token
  };
};

// ✅ Export all functions in one place
export { register, login, generateAPI };