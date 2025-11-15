import axios from "axios";
import express from "express";
import type { Request, Response } from "express";
import 'dotenv/config'

const processedMessages = new Set();

export const subscribeMail = async (req:Request, res:Response) => {

let token = process.env.ACCESS_TOKEN;

if(!token){
    return null
}
  const subscriptionBody = {
    changeType: 'created',  
    notificationUrl: 'https://keith-unvenereal-aniyah.ngrok-free.dev/mail/webhook', 
    resource: "me/mailFolders('Inbox')/messages",
    expirationDateTime: new Date (Date.now () + 60 * 60 * 1000).toISOString (), 
    clientState: 'secretClientValue',
  };
  try {
      const response = await fetch (
        'https://graph.microsoft.com/v1.0/subscriptions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify (subscriptionBody),
        }
      );
      console.log ('2');
      const data = await response.json ();
      console.log ('Subscription response:', data);
      res.status(200).json({message: "Subscribed to mail notifications"});
  } catch (err) {
   console.log(err)
  }
}

export const webhookHandler = async (req:Request, res:Response) => {
  if (req.query && req.query.validationToken) {
    console.log ('Validation request received from Graph');
    return res.status (200).send (req.query.validationToken);
  }
console.log ('Notification received from Graph:', req.body);
  res.sendStatus (200);
  if (req?.body?.value) {

  const notifications = req.body.value;

     if (notifications && notifications.length > 0) {
    console.log(" New notification received");

    for (const n of notifications) {
      console.log(" Notification details:", n);

      // Extract message ID
      const resource = n.resource; // e.g. me/mailFolders('Inbox')/messages/AAMkAD...
      const messageId = resource.split("/").pop();

    if (processedMessages.has(messageId)) {
      console.log("⏩ Skipping duplicate notification for:");
      continue;
    }


    let token = process.env.ACCESS_TOKEN;
      const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const message = await response.json();
          processedMessages.add(messageId);

      console.log("✉️ Full email:", {
        subject: message.subject,
        from: message.from?.emailAddress?.address,
        preview: message.bodyPreview,
      });
    }
  }
    // Here you can fetch new emails using Graph API
  }
}