import type { Request, Response } from "express";
import "dotenv/config";
import getTasks from "../../actions/gemini.js";
import { userConnections } from "../../config/wsConfig.js";
import taskSchema from "../../actions/schema/taskSchema.js";
import dotenv from 'dotenv';
dotenv.config();

export const subscribeMail = async (userId:any, token:any) => {
  if (!token) {
    return null;
  }
  const subscriptionBody = {
    changeType: "created",
    notificationUrl:
      process.env.API_URL+"/mail/webhook",
    resource: "me/mailFolders('Inbox')/messages",
    expirationDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    clientState: "secretClientValue",
  };
  try {
    const response = await fetch(
      "https://graph.microsoft.com/v1.0/subscriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscriptionBody),
      },
    );
    const data = await response.json();

    console.log("Subscription response:", data.id);
    return data.id;
    // return({ message: "Subscribed to mail notifications" , subscriptionId});
  } catch (err) {
    console.log(err);
  }
};
const processedMessages = new Set<string>();
const mailThreads = new Map<string, any[]>(); // subscriptionId -> emails
const tasksCalculated = new Set<string>(); // subscriptionId that already calculated tasks
// export const webhookHandler = async (req: Request, res: Response) => {
//   if (req.query && req.query.validationToken) {
//     console.log("Validation request received from Graph");
//     return res.status(200).send(req.query.validationToken);
//   }
//   // console.log("Notification received from Graph:", req.body);
//   res.sendStatus(200);
//   if (req?.body?.value) {
//     const notifications = req.body.value;

//     if (notifications && notifications.length > 0) {
//       console.log(" New notification received");
// let mailThread=[]

//       for (const n of notifications) {

//         // Extract message ID
//         const resource = n.resource; // e.g. me/mailFolders('Inbox')/messages/AAMkAD...
//         const messageId = resource.split("/").pop();

//         if (processedMessages.has(messageId)) {
//           console.log("⏩ Skipping duplicate notification for:");
//           continue;
//         }

// let subscriptionid = n.subscriptionId;
// if (userConnections.has(subscriptionid)) {
//         const { token } = userConnections.get(subscriptionid)!;
//         const response = await fetch(
//           `https://graph.microsoft.com/v1.0/me/messages/${messageId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           },
//         );

//         const message = await response.json();
//         processedMessages.add(messageId);

//         let emailData = {
//           subject: message.subject,
//           from: message.from?.emailAddress?.address,
//           preview: message.bodyPreview,
//         };
// mailThread.push(emailData)
//         //send email to repsective ws
//         const ws = userConnections.get(subscriptionid)!.ws;
//         ws.send(
//           JSON.stringify({
//             subject: message.subject,
//             from: message.from?.emailAddress?.address,
//             preview: message.bodyPreview,
//           }),
//         );

//         const tasks = await getTasks(emailData);
//         console.log("tasks", tasks);
//         ws.send(
//           JSON.stringify({
//             tasks: tasks,
//           }),
//         );

//       }
//     }
//     }
//     // Here you can fetch new emails using Graph API
//   }
// };

export const webhookHandler = async (req: Request, res: Response) => {
  if (req.query && req.query.validationToken) {
    console.log("Validation request received from Graph");
    return res.status(200).send(req.query.validationToken);
  }

  res.sendStatus(202); // respond immediately so Graph doesn't retry

  const notifications = req?.body?.value;
  if (!notifications || notifications.length === 0) return;

  console.log("📥 New notifications received:", notifications.length);

  for (const n of notifications) {
    const resource = n.resource;
    const messageId = resource.split("/").pop();
    const subscriptionId = n.subscriptionId;

    // Skip duplicate messages
    if (processedMessages.has(messageId)) {
      console.log("⏩ Skipping duplicate notification:", messageId);
      continue;
    }

    if (!userConnections.has(subscriptionId)) continue;
    const { token, ws } = userConnections.get(subscriptionId)!;

    // Fetch the email message from Graph
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages/${messageId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const message = await response.json();
    processedMessages.add(messageId);

    const emailData = {
      subject: message.subject,
      from: message.from?.emailAddress?.address,
      to : message?.toRecipients?.map((r:any)=>r.emailAddress.address),
      preview: message.bodyPreview,
    };

    // Add email to the subscription's global thread
    if (!mailThreads.has(subscriptionId)) mailThreads.set(subscriptionId, []);
    mailThreads.get(subscriptionId)!.push(emailData);

    // Send updated thread to WebSocket
    // ws.send(JSON.stringify({ thread: mailThreads.get(subscriptionId) }));

    // Calculate tasks once per subscription
    if (!tasksCalculated.has(subscriptionId)) {
      try{
const tasks = await getTasks([emailData]);
      console.log(tasks.output, emailData)
      let res = await sendTaskToDB(tasks.output,emailData)
      console.log("res", res)
       ws.send(JSON.stringify(res));


      }
      catch(err)
      {
        console.log("error in getTasks")
      }
    }
  }
};


export const getEmail = async (req: Request, res: Response) => 
  {
  
let token = req.body.accessToken;
console.log("request reached here")
console.log(token)
  if (!token) {
    return res.status(400).json({ error: "Access token is required" });
  }
  try {
 const response = await fetch(
      "https://graph.microsoft.com/v1.0/me",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
const data = await response.json();
   console.log(data.mail)
  res.status(200).json({
    email: data.mail
  });
  }
  catch(err)
{
  res.send(err)
}

}

export const sendTaskToDB = async (data:any, emailData:any) => {
  try {
   console.log({ 
       message_id: emailData.subject,
      title: emailData?.subject,
      email_type: "email",
      user_email: emailData?.to[0],
      description: emailData?.preview,
      show: true,
      actions: data?.actions,
      entities: data?.entities})


   const response = await new taskSchema({
      message_id:data?.message_id,
      title: emailData?.subject,
      email_type: "email",
      user_email: emailData.to[0],
      description: emailData.preview,
      show: true,
      actions: data?.actions,
      icon : data?.icon,
      entities: data?.entities
    }).save();
    
    // const saved = await taskSchema.findOne({ message_id: emailData.subject });
    console.log(" Task saved to DB:",response);
    return response;

  } catch (error) {
    console.error("Error saving task:", error);
    throw error;
  }
};