import type { Request, Response } from "express";
import "dotenv/config";
import getTasks from "../../actions/gemini.js";
import { userConnections } from '../../config/wsConfig.js';

const processedMessages = new Set();

export const subscribeMail = async (userId:string, token:string) => {
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
    console.log("Subscription response:", data);
    return({ message: "Subscribed to mail notifications" });
  } catch (err) {
    console.log(err);
  }
};

export const webhookHandler = async (req: Request, res: Response) => {
  if (req.query && req.query.validationToken) {
    console.log("Validation request received from Graph");
    return res.status(200).send(req.query.validationToken);
  }
  console.log("Notification received from Graph:", req.body);
    const userIds = Array.from(userConnections.keys());
    if (userIds.length === 0) {
      console.log("No connected users to send data to.");
      return;
    }
  res.sendStatus(200);
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
          console.log(" Skipping duplicate notification for:");
          continue;
        }
        let userSocket = userConnections.get(n.subscriptionId);
        if (!userSocket) {
          console.log(`No WebSocket connection found for userId: ${n.subscriptionId}`);
          continue;
        }
        console.log("meow"+ userSocket.token);

        let  token= 'EwBoBMl6BAAUBKgm8k1UswUNwklmy2v7U/S+1fEAAbIEr0EgqUF9xzrMD65F+QBRG5EUfbMO1p7nfjE6jY9b5bU9kKyypKJfllO7zzTxwDa5K41OpKqTE9yuaUQq4Os1zpR5W7grIjlNxRkWmMM2IffFXcr8nrqg+1DTalM5G7xSAN9PGKmMS3uGJNyvdli9woEmE/BhTbDtzygNmhLgblT9zMAebcl0+fK4Iw+l8nqBjDpL+LY3mwhsygUsEbDxvc/Uunl1KcDmgrDs1mAO9IBoQNuQENsmCoD0HfPDuJ4tqm4sCZWk0MlulWNiOjjRMhhEMWrc6OrkUpkM6KJpSeRIUo+32ArDZVUgZQvP9nz/AUhTB+Do6eDy+WfXHXsQZgAAEGiHWFWHcpLAD18NsapRgUAwAw8wWG5/mr1fl0VYqTC48Xavsbe1B89qoGVX80Bsh2pTdlw3V+v1JpnSkLDGdLH5INmPMoLvLZUTFfvhekodMHn1aoqSBDyX3rXbjEqS8vzZ+h50LB9usgVAYSh2HYDbtHl4NcVr4Q6vCV1nhf9jvbsJqYchOf+goMf1Tu1hQxblQ9i0q7IjEyA8tIur6SDhHEEESfKvtsFuF+W9vjqKxsxJEH4mhaytSy1BIR2j6nU3B39OfLJyENonhu6wAnaLTPm4ZJRfJ5CyViWj3GCOLzT/037/aji1r9GNfonlSq/jrPLsq5D/Kuzpj8BqIQVxHaIGQwvPQGucyyOhntISjghNOzwafcrJJIg6TX/zCdXQhs0FsLGggsA/pyLrjpXOp3qTg9ctudA5BootmcZE23Ty57sny/yg28lOVFry1j5/qFYHNm+jM0nShd2Gaaox3RbAYwd/NLBqJfBwLovCS7BScWUnMkhJ9IgWAOt+Ml03YFRTAuQH9QRYnvmjVb8VtsKBiIGI53QeWH9LiW0lb9rX/pHIlc1IzgUISbiazvWPOjaUc+qYpiNkVe1zRYRHwxvA4YwYJlw56+cL517BofGJijsdQcxnbwf4AtqtT6NOm6PYBma1TBtItmoZKSh68TlDsHE7oecruN+ygB2lrVrTBt2viYe3baWDGMZy27uefarGA76cthSURE3EKIynNzFaMt58mRKxl9pSp7pQ+pYj9XXJnUQ9hxIxwRA2J6nNEXylUJV9+BULpdCnUpVY4oNAcvJbHArTLhuNKdwvjufZzPQn4R4H03TlwcuK9bZkHVsh0wgC7QX+SXMK6wkCQLiqt+VLstZ9nsRQWVOQr+DUKEp5Md94acZ2jmn/MctoL3/Swn/174dzX2NKX8TAB+oOY1Vs2FLeWQKNoC2amEDjz3sbCpJrN5CJ00bHIGtwue2aumXzU297+l1yWBkPrMHmDrPVfBcVRgpe1k3SqHe0jITUB4TiqXyxA09qZNvSEnh32y6i9aPxVrtZG+6KCVnkX0iCIupzlh0CP3VGgXec9Go0Tw5AyurynPxLOkPW9p0C2XvzKRM/6dLs9mWpxnMD'
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

        let email =  {
          subject: message.subject,
          from: message.from?.emailAddress?.address,
          to: message.toRecipients?.map((r: any) => r.emailAddress.address).join(", "),
          preview: message.bodyPreview,
        }

       console.log("New email received:", email);
         
        let userId = n.subscriptionId; // Adjust based on actual notification structure
        const ws = userConnections.get(userId);
        console.log(userId)
        // const tasks = await getTasks(message);
        console.log("tasks", tasks);

      }}


    
    // Here you can fetch new emails using Graph API
  }
};


export const getEmail = async (req: Request, res: Response) => 
  {
  
let token = req.body.accessToken;
console.log("request reached here")
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