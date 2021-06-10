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
const socketEvents = (io) => {
  //Set Listeners
  io.on('connection', (socket)=> {
    console.log('a user has connected');

    socket.on('enter channel', (channel, username) => {
      if (username) {
        socket.join(channel);
        io.sockets.in(channel).emit('user joined', `${username} has joined the channel`)
        console.log('user has joined channel' , channel, username)
      } else {
        return false
      }
    });

    socket.on('leave channel', (channel, username) => {
      socket.leave(channel);
      io.sockets.in(channel).emit('user left', `${username} has left the channel`);
      console.log('user has left channel', channel, username)
    });
    
    socket.on('new message', (socketMsg) => {
      io.sockets.in(socketMsg.channel).emit('refresh messages', socketMsg);
      console.log('new message received in channel', socketMsg)
    });

    socket.on('enter privateMessage', (conversationId) => {
     socket.join(conversationId);
    });

    socket.on('leave privateMessage', (conversationId) => {
      socket.leave(conversationId);
    })

    socket.on('new privateMessage', (socketMsg) => {
      io.sockets.in(socketMsg.conversationId).emit('refresh privateMessages', socketMsg);
    })

    socket.on('user typing', (data) => {
      io.sockets.in(data.conversationId).emit('typing', data)
    })

    socket.on('disconnect', () => {
      console.log('user disconnected')
    });
  });
}

export default socketEvents