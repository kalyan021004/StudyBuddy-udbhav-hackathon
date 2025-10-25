import express, { Request, Response } from "express";
import { register, login } from "../services/auth.service";
const router = express.Router();

interface loginData {
    email: string,
    password: string
}

interface registerData {
  username: string,
  email: string,
  password: string
}

router.post('/login', async (req: Request, res: Response) => {
    let data: loginData = req.body;
    const result: { success: true; message: string; token: string }
  | { success: false; message: string } = await login(data);
  return res.status(result.success ? 200 : 400).json(result);
});

router.post('/register', async (req: Request, res: Response) => {
    let data: registerData = req.body;
    const result: { success: boolean; message: string } = await register(data);
  return res.status(result.success ? 200 : 400).json(result);
});

export default router;