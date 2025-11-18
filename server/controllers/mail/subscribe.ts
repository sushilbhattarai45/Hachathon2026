import type { Request, Response } from "express";
import "dotenv/config";
import getTasks from "../../actions/gemini.js";
import { userConnections } from "../../config/wsConfig.js";

const processedMessages = new Set();

export const subscribeMail = async (userId:any, token:any) => {
  if (!token) {
    return null;
  }
  const subscriptionBody = {
    changeType: "created",
    notificationUrl:
      "https://keith-unvenereal-aniyah.ngrok-free.dev/mail/webhook",
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

export const webhookHandler = async (req: Request, res: Response) => {
  if (req.query && req.query.validationToken) {
    console.log("Validation request received from Graph");
    return res.status(200).send(req.query.validationToken);
  }
  // console.log("Notification received from Graph:", req.body);
  res.sendStatus(200);
  if (req?.body?.value) {
    const notifications = req.body.value;

    if (notifications && notifications.length > 0) {
      console.log(" New notification received");

      for (const n of notifications) {

        // Extract message ID
        const resource = n.resource; // e.g. me/mailFolders('Inbox')/messages/AAMkAD...
        const messageId = resource.split("/").pop();

        if (processedMessages.has(messageId)) {
          console.log("⏩ Skipping duplicate notification for:");
          continue;
        }

let subscriptionid = n.subscriptionId;

if (userConnections.has(subscriptionid)) {
        const { token } = userConnections.get(subscriptionid)!;
        const response = await fetch(
          `https://graph.microsoft.com/v1.0/me/messages/${messageId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const message = await response.json();
        processedMessages.add(messageId);

        let emailData = {
          subject: message.subject,
          from: message.from?.emailAddress?.address,
          preview: message.bodyPreview,
        };

        //send email to repsective ws
        const ws = userConnections.get(subscriptionid)!.ws;
        ws.send(
          JSON.stringify({
            subject: message.subject,
            from: message.from?.emailAddress?.address,
            preview: message.bodyPreview,
          }),
        );

        const tasks = await getTasks(emailData);
        console.log("tasks", tasks);
        ws.send(
          JSON.stringify({
            tasks: tasks,
          }),
        );

      }
    }
    }
    // Here you can fetch new emails using Graph API
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