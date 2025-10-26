import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.config";


// ----------------- ROUTES IMPORTS -----------------
import authRoutes from "./routes/auth.routes";


const app = express();
const PORT=8080;

// ----------------- MIDDLEWARE -----------------
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Request logger middleware - MOVED BEFORE ROUTES
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("➡️", req.method, req.url);
  console.log("Headers:", req.headers['authorization']);
  console.log("Body:", req.body);
  next();
});

// ----------------- DATABASE CONNECTION -----------------
connectDB();

// ----------------- TEST ROUTES -----------------
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "yo" });
});

app.get("/ping", (req: Request, res: Response) => {
  res.status(200).json({
    message: "OK",
    time: new Date().toISOString(),
  });
});

// ----------------- ACTUAL ROUTES -----------------
app.use("/auth", authRoutes);  // REMOVED THE DUPLICATE - Keep only this one

// ----------------- ERROR HANDLER -----------------
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;