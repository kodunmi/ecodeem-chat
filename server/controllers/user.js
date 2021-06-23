// utils
import makeValidation from '@withvoid/make-validation';
import ChatRoom from '../models/ChatRoom.js';
// models
import UserModel from '../models/User.js';

export default {
  onGetAllUsers: async (req, res) => {
    try {
      const users = await UserModel.getUsers();
      return res.status(200).json({ success: true, users });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  onGetUserById: async (req, res) => {
    try {
      const user = await UserModel.getUserByEcodeemId(req.params.id);

      console.log(user);
      return res.status(200).json({ success: true, user });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  onCreateUser: async (req, res) => {
    try {
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
          firstName: { type: types.string },
          lastName: { type: types.string },
          ecodeemId:{type: types.string},
          username:{type:types.string}
        }
      }));
      if (!validation.success) return res.status(400).json({ ...validation });

      const { firstName, lastName,  avatar, ecodeemId , username} = req.body;
      const user = await UserModel.createUser(firstName, lastName, avatar, ecodeemId, username);
      return res.status(200).json({ success: true, user });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  onDeleteUserById: async (req, res) => {
    try {
      const user = await UserModel.deleteByUserById(req.params.id);
      return res.status(200).json({ 
        success: true, 
        message: `Deleted a count of ${user.deletedCount} user.` 
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    } 
  },
  onGetUserGroups: async (req, res) => {
    try {
      const user = await UserModel.getUserByEcodeemId(req.params.id);

      return res.status(200).json({ success: true, groups: user.groups });

    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  onGetUserChats: async (req, res) => {
    try {
      const user = await UserModel.getUserByEcodeemId(req.params.id);

      return res.status(200).json({ success: true, chats: user.chats });

    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },

  onGetRecentConversationById:async (req, res) => {
    try {
      const user = await UserModel.findOne({ecodeemId: req.params.id})
      const userId = user._id;
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      const rooms = await ChatRoom.getChatRoomsByUserId(userId);
     
      // const roomIds = rooms.map(room => room._id);

      // let allcon =  roomIds.forEach(id => {
        
      // });
      // const l = await ChatRoom.getChatRoomByRoomId(id)

    //  roomIds.map(id => {
        
    //     return rooms
    //   })


      

    return rooms



    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  }
}