import { subscribe } from 'diagnostics_channel';
import express from 'express';
import { subscribeMail } from './controllers/mail/subscribe.js';
import MailRouter from './routers/mailRouter.js';
import WebSocket from 'ws';
const app = express();
const PORT = 6000;
import { stratWebSocketConnections } from './config/wsConfig.js';
app.use(express.json());
const server =app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('subscribed')
});


app.use('/mail', MailRouter);

app.get('/hi', (req, res) => {
  res.send('Hello from the server!');
}
)

stratWebSocketConnections(server);


import { userConnections } from './config/wsConfig.js';

const randomlySelectUserandSendData =()=>{
  const userIds = Array.from(userConnections.keys());
  if (userIds.length === 0) {
    console.log("No connected users to send data to.");
    return;
  }
  const randomIndex = Math.floor(Math.random() * userIds.length);
  const selectedUserId = userIds[randomIndex];
  if(selectedUserId==null){
    console.log("No user id found");
    return;
  }
  const ws = userConnections.get(selectedUserId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    const message = `Hello User ${selectedUserId}, this is a random message!`;
    ws.send(message);
    console.log(`Sent message to User ${selectedUserId}: ${message}`);
  } else {
    console.log(`WebSocket for User ${selectedUserId} is not open.`);
  }


}
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      randomlySelectUserandSendData();
    }, i * 2000);
  }