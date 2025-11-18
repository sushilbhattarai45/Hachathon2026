import { subscribe } from 'diagnostics_channel';
import express from 'express';

import ActionsRouter from './routers/actionsRouter.js';
import MailRouter from './routers/mailRouter.js';
import WebSocket from 'ws';
import mongoose from 'mongoose';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
const PORT = 6000;
import UserRouter from './routers/userRouter.js';
let connectDb = async()=>{
    await mongoose.connect('mongodb+srv://root:root@maincluster.lhwinaa.mongodb.net/?appName=maincluster').then(
        () => {
            console.log('Connected to MongoDB');
        },
        (err) => {
            console.log('Error connecting to MongoDB:', err);
        }
    );

    
}
connectDb();
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

app.use("/user", UserRouter);

app.use("/actions", ActionsRouter);

stratWebSocketConnections(server);


import { userConnections } from './config/wsConfig.js';

