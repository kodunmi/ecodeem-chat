import mongoose from "mongoose";
import ChatRoom from "./ChatRoom.js";

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    avatar: String,
    ecodeemId: String,
    username: String,
  },
  {
    timestamps: true,
    collection: "users",
  }
);

/**
 * @param {String} firstName
 * @param {String} lastName
 * @returns {Object} new user object created
 */
userSchema.statics.createUser = async function (firstName, lastName,  avatar, ecodeemId, username,) {
  try {
    const user = await this.create({ firstName, lastName,  avatar, ecodeemId, username });
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} id, user id
 * @return {Object} User profile object
 */
userSchema.statics.getUserById = async function (id) {
  try {
    const user = await this.findOne({ _id: id });
    if (!user) throw ({ error: 'No user with this id found' });
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * @return {Array} List of all users
 */
userSchema.statics.getUsers = async function () {
  try {
    const users = await this.find().populate('chatrooms')
    return users;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Array} ids, string of user ids
 * @return {Array of Objects} users list
 */
userSchema.statics.getUserByIds = async function (ids) {
  try {
    const users = await this.find({ _id: { $in: ids } });
    return users;
  } catch (error) {
    throw error;
  }
}

userSchema.statics.getUserByEcodeemIds = async function (ids) {
  try {
    const users = await this.find({ ecodeemId: { $in: ids } });
    return users;
  } catch (error) {
    throw error;
  }
}

userSchema.statics.getUserByEcodeemId = async function (ecodeemId) {
  try {
    const user = await this.findOne({ ecodeemId: ecodeemId });

    // const chats = await ChatRoom.find({
    //   userIds: user._id,
    //   chatType: 'private'
    // })

    // chats.aggregate()



    // const groups = await ChatRoom.find({
    //   userIds: user._id,
    //   chatType: 'group'
    // })

    const chats = await ChatRoom.aggregate([
      // { $project : { 'chatInitiator': 0, 'userIds':0 }},
      { $match: {userIds: { $all: [user._id] }, chatType: 'private' }},
    //   {
    //       $lookup: {
    //         from: 'users',
    //         localField: 'chatInitiator',
    //         foreignField: '_id',
    //         as: 'creator'
    //       },
    //   },
    //   {
    //     $lookup: {
    //       from: 'users',
    //       localField: 'userIds',
    //       foreignField: '_id',
    //       as: 'members'
    //     },
    // },
    //   {$unwind: '$creator'},
    ])

    const groups = await ChatRoom.aggregate([
      { $match: {userIds: { $all: [user._id] }, chatType: 'group' }},
      // {
      //   $group:{
      //     _id: '$_id',
      //     name: '$name',
      //     avatar:'$avatar',
      //     descriptiion:'$descriptiion'
      //   }
      // }
    //   {
    //       $lookup: {
    //         from: 'users',
    //         localField: 'chatInitiator',
    //         foreignField: '_id',
    //         as: 'creator'
    //       },
    //   },
    //   {
    //     $lookup: {
    //       from: 'users',
    //       localField: 'userIds',
    //       foreignField: '_id',
    //       as: 'members'
    //     },
    // },
      // {$unwind: '$creator'},
    ])

    return {
      user,
      chats,
      groups
      
    }

    // console.log(chats);
    // const userObj = {
    //   ...user,
    //   chat: {

    //   },
    //   groups:{

    //   }
    // }
    // return users;

    // const agg = this.aggregate([
    //   {$match: { ecodeemId: ecodeemId }},

    //   {
    //     $lookup: {
    //       from: 'chatrooms',
    //       localField: '_id',
    //       foreignField: 'userIds',
    //       as: 'chats'
    //     }
    //   },
      // {"$unwind":"chats"},
      // {"$match":{"chats.chatType":'private'}}

      
      // {$unwind: '$creator'},
      // {
      //   $lookup: {
      //     from: 'users',
      //     localField: 'userIds',
      //     foreignField: '_id',
      //     as: 'members'
      //   },
      // },
      
    // ]);
    // console.log('====================================');
    //   console.log(agg);
    //   console.log('====================================');

    // return agg;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} id - id of user
 * @return {Object} - details of action performed
 */
userSchema.statics.deleteByUserById = async function (id) {
  try {
    const result = await this.remove({ ecodeemId: id });
    return result;
  } catch (error) {
    throw error;
  }
}

export default mongoose.model("User", userSchema);
