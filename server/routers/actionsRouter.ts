import { addPersonalCalendarEvent } from "../actions/actions.js";
import express from "express";

const ActionsRouter = express.Router();

ActionsRouter.post("/createCalendarEvent", async (req, res) => {
  if (!req.body.subject || !req.body.body || !req.body.start || !req.body.end || !req.body.token) {
    res.status(400).json({ error: "Missing required fields." });
    return;
  }
  addPersonalCalendarEvent(req.body, req.body.token);
});


export default ActionsRouter;
