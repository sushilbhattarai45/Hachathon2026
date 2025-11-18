import { addPersonalCalendarEvent } from "../actions/actions.js";
import express from "express";

const ActionsRouter = express.Router();

ActionsRouter.post("/createCalendarEvent", async (req, res) => {
 // Extract token and event details separately
 const accessToken = req.body.token;
 const eventDetails = req.body;

 // 1. Basic Validation (Checking required fields for MeetingDetails)
 if (
 !eventDetails.subject ||
 !eventDetails.body ||
!eventDetails.start ||
!eventDetails.end ||
 !accessToken
 ) {
return res.status(400).json({ error: "Missing required fields (subject, body, start, end, or token)." });
 }

// 2. Remove the token from the event details object
// This ensures only valid MeetingDetails fields are passed to the API call.
delete eventDetails.token;

 try {
// 3. Await the async function call and pass eventDetails and accessToken separately
 const result = await addPersonalCalendarEvent(eventDetails, accessToken);

// 4. Send a success response back to the client
 res.status(200).json({
 message: "Personal calendar event successfully created.",
event: result,
 });
 } catch (error) {
// 5. Handle any errors from the API call and send an error response
    console.error("Error creating calendar event:", error);
    res.status(500).json({
      error: "Failed to create personal calendar event.",
      details: error instanceof Error ? error.message : "An unknown error occurred.",
    });
  }
});

export default ActionsRouter;