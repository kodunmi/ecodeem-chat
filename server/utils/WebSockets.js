// class WebSockets {
//   users = [];
//   connection(client) {
//     // event fired when the chat room is disconnected
//     client.on("disconnect", () => {
//       this.users = this.users.filter((user) => user.socketId !== client.id);
//     });
//     // add identity of user mapped to the socket id
//     client.on("identity", (userId) => {
//       this.users.push({
//         socketId: client.id,
//         userId: userId,
//       });
//     });
//     // subscribe person to chat & other user as well
//     client.on("subscribe", (room, otherUserId = "") => {
//       this.subscribeOtherUser(room, otherUserId);
//       client.join(room);
//     });
//     // mute a chat room
//     client.on("unsubscribe", (room) => {
//       client.leave(room);
//     });
//   }

//   subscribeOtherUser(room, otherUserId) {
//     const userSockets = this.users.filter(
//       (user) => user.userId === otherUserId
//     );
//     userSockets.map((userInfo) => {
//       const socketConn = global.io.sockets.connected(userInfo.socketId);
//       if (socketConn) {
//         socketConn.join(room);
//       }
//     });
//   }
// }

// export default new WebSockets();

const USER_JOIN_CHAT_EVENT = "USER_JOIN_CHAT_EVENT";
const USER_LEAVE_CHAT_EVENT = "USER_LEAVE_CHAT_EVENT";
const NEW_CHAT_MESSAGE_EVENT = "NEW_CHAT_MESSAGE_EVENT";
const START_TYPING_MESSAGE_EVENT = "START_TYPING_MESSAGE_EVENT";
const STOP_TYPING_MESSAGE_EVENT = "STOP_TYPING_MESSAGE_EVENT";


const socketEvents = (io) => {
  //Set Listeners
  io.on('connection', (socket)=> {
    console.log(`${socket.id} connected`);

    socket.on(USER_JOIN_CHAT_EVENT, (conversationId) => {
      console.log(socket.id+'user joined room'+conversationId);
     socket.join(conversationId);
    });

    socket.on('leave privateMessage', (conversationId) => {
      socket.leave(conversationId);
    })

    socket.on('new privateMessage', (socketMsg) => {
      io.sockets.in(socketMsg.conversationId).emit('refresh privateMessages', socketMsg);
    })

    socket.on(START_TYPING_MESSAGE_EVENT, (data) => {
      socket.to(data.conversationId).emit(START_TYPING_MESSAGE_EVENT, data)

      console.log('typing',data.conversationId);
    })

    socket.on(STOP_TYPING_MESSAGE_EVENT, (data) => {
      socket.to(data.conversationId).emit(STOP_TYPING_MESSAGE_EVENT, data)
      console.log('stoptyping', data);
    })

    socket.on('disconnect', () => {
      console.log('user disconnected')
    });
  });
}

export default socketEvents