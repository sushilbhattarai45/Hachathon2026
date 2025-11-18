import type { Request, Response } from "express";
import "dotenv/config";
import getTasks from "../../actions/gemini.js";
import { userConnections } from "../../config/wsConfig.js";
import taskSchema from "../../actions/schema/taskSchema.js";
import dotenv from 'dotenv';
dotenv.config();

export const getTasksForUser = async (req: Request, res: Response) => {
    const email = req.body.user_email;
    console.log(email)
    console.log("request reached here")
    console.log(email)

    const tasks = await taskSchema.find({ user_email: email });
    console.log(tasks)
    res.status(200).json({ tasks });
}

