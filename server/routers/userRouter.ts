import express from 'express';
import { login, updateUserTags } from '../controllers/user/userController.js';
const UserRouter = express.Router();
UserRouter.post('/login', login);
UserRouter.post('/updateTags', updateUserTags);
export default UserRouter;