import express from 'express';
// controllers
import chatRoom from '../controllers/chatRoom.js';

const router = express.Router();

router
  .get('/', chatRoom.getAllRooms)
  .get('/:roomId', chatRoom.getConversationByRoomId)
  .post('/:roomId/add-user', chatRoom.addUser)
  .post('/:roomId/remove-user', chatRoom.removeUser)
  .post('/initiate-group', chatRoom.initiate)
  .post('/initiate-chat', chatRoom.initiate)
  .post('/:roomId/message', chatRoom.postMessage)
  .put('/:roomId/mark-read', chatRoom.markConversationReadByRoomId)

export default router;
