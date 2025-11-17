import express from "express";
import { getEmail, subscribeMail, webhookHandler } from "../controllers/mail/subscribe.js";

const Router = express.Router();

// Router.post("/subscribe", subscribeMail);
Router.post("/webhook", webhookHandler);
Router.post("/getEmail", getEmail)

export default Router;