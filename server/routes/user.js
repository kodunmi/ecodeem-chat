import express from 'express';
import chatRoom from '../controllers/chatRoom.js';
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
  .get('/:id/all',chatRoom.getUserRooms)
  .get('/:id/unread',chatRoom.getAllUnreadMessages)
  
  
  

export default router;
