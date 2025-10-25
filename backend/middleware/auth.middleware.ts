import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model";
import { IUser } from "../interface/user.interface";

interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

interface decodedJWT {
  username: string;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1]; // Expect "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const secret = process.env.SECRET_KEY as string;
    if (!secret) {
      throw new Error("JWT_SECRET not configured in environment");
    }

    const decoded = jwt.verify(token, secret) as decodedJWT; 
    const user: IUser = await User.findOne({ username: decoded.username }).select("-password");
    if(!user) return res.status(404).json({ success: false, message: "User not found" });
      req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


export default authMiddleware;
