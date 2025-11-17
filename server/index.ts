console.log ('hii');
import express from 'express';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js"; 
import MailRouter from './routers/mailRouter.js';

const app = express();
const PORT = 8000;

app.all("/api/auth/*", toNodeHandler(auth)); // Better Auth handles the OAuth callbacks

app.use(express.json());
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('subscribed')
});

app.use('/mail', MailRouter);

