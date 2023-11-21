
const mongoose = require("mongoose");
const Message = require("../models/message");
const systemUserId = new mongoose.Types.ObjectId();

module.exports = (io) => {
  io.on("connection", (client) => {
    // console.log("new connection");

    const userName = client.handshake.query.userName;
    // console.log("Username:", userName);
    const joinMessage = {
      content: `A user joined the chat`,
      userName: "[Notice]",
      user: systemUserId,
    };
  
    Message.create(joinMessage).then(() => {
      io.emit("message", joinMessage);
    });
  
    client.on("disconnect", () => {
      const leaveMessage = {
        content: `A user left the chat`,
        userName: "[Notice]",
        user: systemUserId,
      };
  
      Message.create(leaveMessage).then(() => {
        client.broadcast.emit("message", leaveMessage);
      });
  
      console.log("user disconnected");
    });

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
