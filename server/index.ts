console.log ('hii');
import { subscribe } from 'diagnostics_channel';
import express from 'express';
import { subscribeMail } from './controllers/mail/subscribe.js';
import MailRouter from './routers/mailRouter.js';

const app = express();
const PORT = 8000;

app.use(express.json());
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('subscribed')
});

app.use('/mail', MailRouter);

