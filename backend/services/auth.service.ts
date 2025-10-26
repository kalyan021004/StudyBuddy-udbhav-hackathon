import bcrypt from "bcryptjs";
import { Document } from "mongoose";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";

// ------------ User Interface ------------
interface IUser extends Document {
  name: string;  // Changed from username to name
  email: string;
  password: string;
}

// ------------ Register User ------------
const register = async (details: {
  name: string;  // Changed from username to name
  email: string;
  password: string;
}): Promise<{ success: boolean; message: string }> => {
  const { name, email, password } = details;  // Changed from username to name

  const existingUser = await User.findOne({ $or: [{ name }, { email }] });  // Changed from username to name
  if (existingUser) {
    return { success: false, message: "Name or email already exists" };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User<IUser>({
    name,  // Changed from username to name
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
}): Promise
  | { success: true; message: string; token: string }
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

  const jwttoken = await generateToken(user.name);  // Changed from username to name
  if (!jwttoken.success) {
    return { success: false, message: jwttoken.message };
  }

  return {
    success: true,
    message: "Login successful",
    token: jwttoken.token,
  };
};

// ------------ Generate API Key for User ------------
const generateToken = async (name: string): Promise<  // Changed from username to name
  | { success: true; token: string }
  | { success: false; message: string }
> => {
  const user = name;

  if (!process.env.SECRET_KEY) {
    return {
      success: false,
      message: "Error in generating the API Key for the RTQI Score."
    };
  }

  const token = jwt.sign(
    { name: user },  // Changed from username to name
    process.env.SECRET_KEY,
  );

  return {
    success: true,
    token: token
  };
};


export { register, login, generateToken };