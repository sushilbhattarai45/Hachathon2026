import express from "express";
import { getEmail, subscribeMail, webhookHandler } from "../controllers/mail/subscribe.js";
import { getTasksForUser } from "../controllers/tasks/tasksController.js";

const Router = express.Router();

Router.post("/subscribe", subscribeMail);
Router.post("/webhook", webhookHandler);
Router.post("/getEmail", getEmail)
Router.post("/tasks/getTasksForUser", getTasksForUser);

export default Router;