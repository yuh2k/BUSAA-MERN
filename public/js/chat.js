$(document).ready(() => {
  let socket;
  let userName = $("#chat-user-name").val(); // Get the username of the chat user
  let userId = $("#chat-user-id").val(); // Get the ID of the chat user

  // Create a Socket.IO client instance and connect to the server if the current page path is '/chat' and a username and user ID are available
  if (window.location.pathname === '/chat' && userName && userId) {
    socket = io();

    // Send a 'joined' message to the server when the user enters the chat
    socket.emit('joined', { userName, userId });

    // Send a 'message' message to the server when the user submits a chat message, and clear the chat input box
    $("#chatForm").submit(() => {
      let text = $("#chat-input").val();
      socket.emit("message", { content: text, userId: userId, userName: userName });
      $("#chat-input").val("");
      return false;
    });

    // Display the received message and add a chat icon animation when a 'message' message is received from the server
    socket.on("message", (message) => {
      displayMessage(message);
      for (let i = 0; i < 20; i++) {
        $(".chat-icon").fadeOut(200).fadeIn(200);
      }
    });

    // Display all messages received from the server when a 'load all messages' message is received
    socket.on("load all messages", (data) => {
      data.forEach((message) => {
        displayMessage(message);
      });
    });

    // Send a 'left' message to the server and disconnect the socket when the user leaves the chat page
    window.addEventListener('beforeunload', () => {
      socket.emit('left', { userName, userId });
      socket.disconnect();
    });
  }

  // Display a chat message with the user's name and content, and add a CSS class to the message based on whether it was sent by the current user or another user
  let displayMessage = (message) => {
    $("#chat").prepend(
      $("<li>").html(
        `<strong class="message ${getCurrentUserClass(message.user)}">${message.userName}</strong>: ${message.content}`
      )
    );
  };

  // Returns a CSS class name based on whether the given user ID matches the ID of the current user
  let getCurrentUserClass = (id) => {
    return userId === id ? "current-user" : "other-user";
  };
});
