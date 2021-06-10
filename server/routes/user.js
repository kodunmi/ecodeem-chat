import express from 'express';
// controllers
import user from '../controllers/user.js';

const router = express.Router();

router
  .get('/', user.onGetAllUsers)
  .post('/', user.onCreateUser)
  .get('/:id', user.onGetUserById)
  .delete('/:id', user.onDeleteUserById)
  .get('/:id/groups',user.onGetUserGroups)
  .get('/:id/chats',user.onGetUserChats)
  
  
  

export default router;
