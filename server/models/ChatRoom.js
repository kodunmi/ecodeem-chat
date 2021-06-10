import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const CHAT_ROOM_TYPES = {
  GROUP: "group",
  PRIVATE: "private",
};

const chatRoomSchema = new mongoose.Schema(
  {
    userIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    chatType: String,
    chatInitiator: { type: mongoose.Schema.ObjectId, required: true },
    name: String,
    avatar: String,
    descriptiion: String
  },
  {
    timestamps: true,
    collection: "chatrooms",
  }
);

/**
 * @param {String} userId - id of user
 * @return {Array} array of all chatroom that the user belongs to
 */
chatRoomSchema.statics.getChatRoomsByUserId = async function (userId) {
  try {
    const rooms = await this.find({ userIds: { $all: [userId] } });

    return rooms;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} roomId - id of chatroom
 * @return {Object} chatroom
 */
chatRoomSchema.statics.getChatRoomByRoomId = async function (roomId) {
  try {
    const room = await this.findOne({ _id: roomId });

    console.log(room);
    if (!room) {
      return false
    }

    const agg = this.aggregate([
      { $match: { _id: room._id } },

      {
        $lookup: {
          from: 'users',
          localField: 'chatInitiator',
          foreignField: '_id',
          as: 'creator'
        },
      },
      { $unwind: '$creator' },
      {
        $lookup: {
          from: 'users',
          localField: 'userIds',
          foreignField: '_id',
          as: 'members'
        },
      },

    ]);

    return agg;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Array} userIds - array of strings of userIds
 * @param {String} chatInitiator - user who initiated the chat
 * @param {CHAT_ROOM_TYPES} type
 */
chatRoomSchema.statics.initiateChat = async function (userIds, type, chatInitiator, name, avatar, description) {
  try {
    const availableRoom = await this.findOne({
      userIds: {
        $size: userIds.length,
        $all: [...userIds]
      },
      chatType: type
    });

    console.log(availableRoom);

    if (availableRoom) {
      return {
        isNew: false,
        message: 'retrieving an old chat room',
        chatRoomId: availableRoom._doc._id,
        type: availableRoom._doc.chatType,
      };
    }

    let newRoom = await this.create({ userIds, chatType: type, chatInitiator, name, avatar, description });

    return {
      isNew: true,
      message: 'creating a new chatroom',
      chatRoomId: newRoom._doc._id,
      type: newRoom._doc.chatType,
    };
  } catch (error) {
    console.log('error on start chat method', error);
    throw error;
  }
}

chatRoomSchema.statics.addUser = async function (roomId, userId) {

  try {
    let room = await this.findOne({ _id: roomId })

    if (!room) {
      return false
    }

    room.userIds.push(userId)

    room.save()

    return room
    
  } catch (error) {
    throw error;
  }
}

chatRoomSchema.statics.removeUser = async function (roomId, userId) {
  function arrayRemove(arr, value) { 
    
    return arr.filter(function(ele){ 
        return ele != value; 
    });
  }

  try {
    let room = await this.findOne({ _id: roomId })

    if (!room) {
      return false
    }

    // const filter = room.userIds.filter(function(ele){ 
    //   return ele != userId; 
    // });

    let index = room.userIds.indexOf(roomId);

    room.userIds.splice(index, 1);

    room.save()

    console.log(room);

    return room
    
  } catch (error) {
    throw error;
  }
}

export default mongoose.model("ChatRoom", chatRoomSchema);
