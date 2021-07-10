// utils
import makeValidation from '@withvoid/make-validation';
// models
import ChatRoomModel, { CHAT_ROOM_TYPES } from '../models/ChatRoom.js';
import ChatMessageModel, {MESSAGE_TYPES} from '../models/ChatMessage.js';
import UserModel from '../models/User.js';
import ChatRoom from '../models/ChatRoom.js';

export default {
  initiate: async (req, res) => {
    try {
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
  
          type: { type: types.enum, options: { enum: CHAT_ROOM_TYPES } },
          ecodeemId: {type: types.string},
        }
      }));
      if (!validation.success) return res.status(400).json({ ...validation });

      const { userId, type, avatar, groupname, groupdescription, ecodeemId } = req.body;

      const chatInitiator = await UserModel.getUserByEcodeemId(ecodeemId)

      const newChatInitiator = chatInitiator.user._id

      const users = await UserModel.getUserByEcodeemIds(userId)

      const newUserIds = users.map(user => user._id);

      const allUserIds = [...newUserIds, newChatInitiator];

      const chatRoom = await ChatRoomModel.initiateChat(allUserIds, type, newChatInitiator,groupname,avatar,groupdescription);

      return res.status(200).json({ success: true, chatRoom });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  postMessage: async (req, res) => {
    try {
      const { roomId } = req.params;
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
          // messageText: { type: types.string },
          type: { type: types.enum, options: { enum: MESSAGE_TYPES } },
          ecodeemId: {type: types.string}
        }
      }));
      if (!validation.success) return res.status(400).json({ ...validation });

      const messagePayload = req.body.messageText;
      const ecodeemId = req.body.ecodeemId;
      const type = req.body.type;
      const link = req.body.link;
      const user = await UserModel.findOne({ecodeemId:ecodeemId})
      const userId = user._id


      const post = await ChatMessageModel.createPostInChatRoom(roomId, messagePayload, userId, link, type );
      global.io.sockets.in(roomId).emit('NEW_CHAT_MESSAGE_EVENT', { message: post });
      console.log(roomId);
      return res.status(200).json({ success: true, post });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  getRecentConversation: async (req, res) => {
    try {
      const user = await UserModel.findOne({ecodeemId: req.body.ecodeemId})
      const currentLoggedUser = user._id;
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      const rooms = await ChatRoomModel.getChatRoomsByUserId(currentLoggedUser);
     
      const roomIds = rooms.map(room => room._id);

      console.log(currentLoggedUser);
      const recentConversation = await ChatMessageModel.getRecentConversation(
        roomIds, options, currentLoggedUser
      );
      return res.status(200).json({ success: true, conversation: recentConversation, chatInfo: rooms });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  getUserRooms: async (req, res) => {
    try {

      const user = await UserModel.getUserByEcodeemId(req.params.id)
      const rooms = await ChatRoomModel.getChatRoomsByUserId(user.user._id);

      console.log('====================================');
      console.log(rooms[0].users._id);
      console.log('====================================');
      
      return res.status(200).json({ success: true, conversations: rooms });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  getAllUnreadMessages: async (req,res) => {
    try {

      const user = await UserModel.getUserByEcodeemId(req.params.id)
      const rooms = await ChatRoomModel.getChatRoomsByUserId(user.user._id);

      let c = rooms.reduce(function (acc, obj) { return acc + obj.Unread; }, 0); 
      
      return res.status(200).json({ success: true, unread: c });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  getConversationByRoomId: async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await ChatRoomModel.getChatRoomByRoomId(roomId)

      console.log(room);
      if (!room) {
        return res.status(400).json({
          success: false,
          message: 'No room exists for this id',
        })
      }
      const users = await UserModel.getUserByIds(room.userIds);
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      const conversation = await ChatMessageModel.getConversationByRoomId(roomId, options);
      return res.status(200).json({
        success: true,
        room: room[0],
        conversation,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  },
  markConversationReadByRoomId: async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await ChatRoomModel.getChatRoomByRoomId(roomId)
      if (!room) {
        return res.status(400).json({
          success: false,
          message: 'No room exists for this id',
        })
      }

      const user = await UserModel.getUserByEcodeemId(req.body.ecodeemId)

      const currentLoggedUser = user.user._id;

      const result = await ChatMessageModel.markMessageRead(roomId, currentLoggedUser);

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error });
    }
  },
  getAllRooms: async (req, res) => {
    try {
     
      const rooms = await ChatRoomModel.find({})
      
      return res.status(200).json({ success: true, data: rooms });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error });
    } 
  },

  addUser: async (req, res) => {
    try {

      const ecodeemId = req.body.ecodeemId;
      const roomId = req.params.roomId;

      const user = await UserModel.getUserByEcodeemId(ecodeemId)

      console.log(roomId, user.user._id);

      const userId = user.user._id

      const result  = await ChatRoom.addUser(roomId, userId)

      if(!result){
        return res.status(401).json({ success: true, message: 'no room with the id' });
      }

      
      return res.status(200).json({ success: true, message: 'user added to room' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error });
    } 
  },

  removeUser: async (req, res) => {
    try {

      const ecodeemId = req.body.ecodeemId;
      const roomId = req.params.roomId;

      const user = await UserModel.getUserByEcodeemId(ecodeemId)

      console.log(roomId, user.user._id);

      const userId = user.user._id

      const result  = await ChatRoom.removeUser(roomId, userId)

      if(!result){
        return res.status(401).json({ success: true, message: 'no room with the id' });
      }
      
      return res.status(200).json({ success: true, message: 'user removed to room' });
      
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error });
    } 
  }

}