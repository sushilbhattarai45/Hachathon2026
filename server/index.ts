import { subscribe } from 'diagnostics_channel';
import express from 'express';
import MailRouter from './routers/mailRouter.js';
import WebSocket from 'ws';
const app = express();
const PORT = 7000;
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

