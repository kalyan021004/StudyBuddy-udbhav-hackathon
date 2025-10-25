import express, { Request, Response } from "express";
import { register, login, generateAPI } from "../services/auth.service";
const router = express.Router();

interface loginData {
    email: string,
    password: string
}

interface registerData {
  username: string,
  email: string,
  password: string,
  confirm_password: string,
}

router.post('/login', async (req: Request, res: Response) => {
    let data: loginData = req.body;
    const result: { success: true; message: string; username: string; email: string }
  | { success: false; message: string } = await login(data);
  return res.status(result.success ? 200 : 400).json(result);
});

router.post('/register', async (req: Request, res: Response) => {
    let data: registerData = req.body;
    const result: { success: boolean; message: string } = await register(data);
  return res.status(result.success ? 200 : 400).json(result);
});

router.get('/get/api/:username', async (req: Request, res: Response) => {
  const username: string = req.params.username as string;
  const result: { success: true; token: string }
  | { success: false; message: string } = await generateAPI(username);
  return res.status(result.success ? 200 : 400).json(result);
});

export default router;