// src/controllers/authController.ts
import type { Request, Response } from "express";
import { auth } from "../../lib/auth.js";


export async function logout(req: Request, res: Response) {
  try {
    await auth.api.signOut({ headers: req.headers as HeadersInit});
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("logout error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

