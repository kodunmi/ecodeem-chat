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
    description: String
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

    const agg = this.aggregate([
      { $match: { userIds: { $all: [userId] } } },
      // {
      //   $lookup: {
      //     from: 'chatmessages',
      //     localField: '_id',
      //     foreignField: 'chatRoomId',
      //     as: 'messages'
      //   }
      // },

      {
        $lookup: {
          from: "chatmessages",
          let: { "roomId": "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$chatRoomId", "$$roomId"] } } },
            {
              $lookup: {
                from: "users",
                let: { "userId": "$postedByUser" },
                pipeline: [
                  { $match: { "$expr": { "$eq": ["$_id", "$$userId"] } } }
                ],
                as: "postedBy"
              }
            },
            {$unwind: "$postedBy"}
          ],
          "as": "messages"
        }
      },

      {
        $lookup: {
          from: 'users',
          localField: 'userIds',
          foreignField: '_id',
          as: 'users'
        },
      },
      {
        $project:
        {
          users: {
            $first: {
              $filter: {
                input: "$users",
                as: "user",
                cond: { $not: [{ $eq: ["$$user._id", userId] }] }
              }
            }
          },
          Unread: {
            $size: {
              $filter: {
                input: "$messages",
                as: "message",
                cond: { $not: { $in: [userId, "$$message.readByRecipients.readByUserId"] } }
              }
            }
          },
          LastMessage: {
            $last: "$messages"
          },
          recentMessages: {
            $slice: ['$messages', 200],
          },
          type: '$chatType',
          name: '$name',
          avatar: '$avatar',
          description: '$description'

        }
      },
    ])

    return agg;
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
      }
    ]);

    return room;
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
        $size: 2,
        $all: [...userIds]
      },
      chatType: 'private'
    });

    console.log(availableRoom);

    // if (availableRoom) {
    //   return {
    //     isNew: false,
    //     message: 'retrieving an old chat room',
    //     chatRoomId: availableRoom._doc._id,
    //     type: availableRoom._doc.chatType,
    //   };
    // }

    let newRoom = await this.create({ userIds, chatType: type, chatInitiator, name, avatar, description });

    return {
      // isNew: true,
      message: 'creating a new chatroom',
      group: newRoom._doc
      // chatRoomId: newRoom._doc._id,
      // type: newRoom._doc.chatType,
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

    return arr.filter(function (ele) {
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
