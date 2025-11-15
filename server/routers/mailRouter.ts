import express from "express";
import { subscribeMail, webhookHandler } from "../controllers/mail/subscribe.js";

const Router = express.Router();

Router.post("/subscribe", subscribeMail);
Router.post("/webhook", webhookHandler);


export default Router;