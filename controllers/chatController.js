const mongoose = require("mongoose");
const Message = require("../models/message");

// Create a new ObjectId to represent the system user
const systemUserId = new mongoose.Types.ObjectId();

module.exports = (io) => {
  io.on("connection", (client) => {

    // Get the user's name from the query string of the handshake
    const userName = client.handshake.query.userName;

    // Create a join message and broadcast it to all connected clients
    const joinMessage = {
      content: `A user joined the chat`,
      userName: "[Notice]",
      user: systemUserId,
    };
    Message.create(joinMessage).then(() => {
      io.emit("message", joinMessage);
    });
  
    // When the client disconnects, create a leave message and broadcast it to all other clients
    client.on("disconnect", () => {
      const leaveMessage = {
        content: `A user left the chat`,
        userName: "[Notice]",
        user: systemUserId,
      };
      Message.create(leaveMessage).then(() => {
        client.broadcast.emit("message", leaveMessage);
      });
    });

    // When the client sends a message, store it in the database and broadcast it to all other clients
    client.on("message", (data) => {
      let messageAttributes = {
        content: data.content,
        userName: data.userName,
        user: data.userId,
      };
      Message.create(messageAttributes)
        .then(() => {
          io.emit("message", messageAttributes);
        })
        .catch((error) => {
          console.log(`error: ${error.message}`);
        });
    });

    // When a new client connects, send the 20 most recent messages to that client
    Message.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .then((messages) => {
        client.emit("load all messages", messages.reverse());
      })
      .catch((error) => {
        console.log(`error: ${error.message}`);
      });
  });
};
