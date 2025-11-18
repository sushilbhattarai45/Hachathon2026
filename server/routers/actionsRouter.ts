import { addPersonalCalendarEvent,addTaskOrReminder } from "../actions/actions.js";
import express from "express";
import taskSchema from "../actions/schema/taskSchema.js";
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


 console.log('hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii'+JSON.stringify(eventDetails))   
// 2. Remove the token from the event details object
// This ensures only valid MeetingDetails fields are passed to the API call.
delete eventDetails.type;
delete eventDetails.token;
delete eventDetails.listName;
delete eventDetails.reminderDetails;
delete eventDetails.title;
console.log(JSON.stringify(eventDetails))


   let payload:any = {
      subject: eventDetails.title,
      start: {
        dateTime: eventDetails.start.dateTime,
        timeZone: eventDetails.start.timeZone
      },
      end: {
        dateTime: eventDetails.end.dateTime,
        timeZone: eventDetails.end.timeZone
      },
      body: {
        contentType: "Text",
        content: eventDetails.title
      },
    }
    
 try {
 const result = await addPersonalCalendarEvent(payload,
    accessToken);
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



});

ActionsRouter.post("/updateTask", async (req, res) => {
    const id = req.body.taskid;



    const taskData = await taskSchema.findOneAndUpdate({ message_id: id },
        { $set: { isactionComplete: true } },
          { new: true });
    console.log(taskData)
    if (!taskData) {
        return res.status(404).json({ error: "Task not found." });
    }
    res.status(200).json({ message: "Task updated successfully." });

    
    
})
export default ActionsRouter;