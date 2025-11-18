import type { Request, Response } from "express";
import User from "../../actions/schema/schema.js";


export const login = async (req: Request, res: Response) => {
const { email, name } = req.body;
console.log("my email is ", req.body)
if (!email) {
  return res.status(400).json({ error: "Email is required" });
}
console.log("registerorlogin called")
try {
  const user = await User.findOne({ email: email });
  if (user) {
    console.log("user exists")
    return res.status(200).json({ error: "User already exists" ,wasUser: true });
  }
  const newUser = new User({ email, name });
  await newUser.save();
  res.status(201).json({ message: "User created successfully", wasUser: false });
} catch (error) {
    console.log("error in login")
  res.status(500).json({ error: "Internal server error" });
}
};


export const updateUserTags = async (req: Request, res: Response) => {
    const { email, tags } = req.body;
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
        user.tags = tags;
        await user.save();
        res.status(200).json({ message: "Tags updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }   
};