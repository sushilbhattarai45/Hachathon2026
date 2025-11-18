import { addPersonalCalendarEvent,addTaskOrReminder } from "../actions/actions.js";
import express from "express";

const ActionsRouter = express.Router();

ActionsRouter.post("/createCalendarEvent", async (req, res) => {
 // Extract token and event details separately
 const accessToken = req.body.token;
 const eventDetails = req.body.outlookPayload;


 console.log(req.body.outlookPayload)
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


 if ( eventDetails.start?.timeZone=="")
 {
    eventDetails.start.timeZone = "America/Chicago"
 }
 if ( eventDetails.end?.timeZone=="")
 {
    eventDetails.end.timeZone = "America/Chicago"
 }


 console.log(eventDetails)
// 2. Remove the token from the event details object
// This ensures only valid MeetingDetails fields are passed to the API call.
delete eventDetails.type;
delete eventDetails.token;
console.log(req.body.type)
if(req.body.type=="create_task")
{
  delete eventDetails.body
  delete eventDetails.start
  delete eventDetails.end
  delete eventDetails.attendees

  console.log("hiiiii")
  console.log(accessToken)
//   const result = await addTaskOrReminder(eventDetails.title,eventDetails, accessToken);
  res.status(200).json({
    message: "Task successfully created.",
    // event: result,
  });
}
else
{
   
    
 try {
 const result = await addPersonalCalendarEvent(eventDetails, accessToken);
 res.status(200).json({
 message: "Personal calendar event successfully created.",
event: result,
 });
 } catch (error) {
 console.error("Error creating calendar event:", error);
res.status(500).json({
 error: "Failed to create personal calendar event.",
      details: error instanceof Error ? error.message : "An unknown error occurred.",
    });
  }
}


});

export default ActionsRouter;