$(document).ready(() => {
  let apiToken = $("#apiToken").text();
  $("#modal-button").click(() => {
    $(".modal-body").html("");
    $.get(`/api/events?apiToken=${apiToken}`, (results = {}) => {
      let data = results.data;
      if (!data || !data.events) return;
      data.events.forEach((event) => {
        $(".modal-body").append(`
        <div>
          <span class="event-title">${event.title}</span>
          <div class="event-description">${event.description}</div>
          <button class="join-button" data-id="${event._id}">Join</button>
        </div>`);
      });
    }).then(() => {
      addJoinButtonListener(apiToken);
    });
  });
});
  
let addJoinButtonListener = (token) => {
  $(".join-button").click((event) => {
    let $button = $(event.target),
      eventId = $button.data("id");
    $.get(`/api/events/${eventId}/join?apiToken=${token}`, (results = {}) => {
      let data = results.data;
      if (data && data.success) {
        $button
          .text("Joined")
          .addClass("joined-button")
          .removeClass("join-button");
      } else {
        $button.text("Try again");
      }
    });
  });
};


$(document).ready(() => {
  let socket;
  let userName = $("#chat-user-name").val();
  let userId = $("#chat-user-id").val();

  if (window.location.pathname === '/chat' && userName && userId) {
    socket = io();

    // When the user enters the chat, send the 'joined' message
    socket.emit('joined', { userName, userId });

    $("#chatForm").submit(() => {
      let text = $("#chat-input").val();
      socket.emit("message", { content: text, userId: userId, userName: userName });
      $("#chat-input").val("");
      return false;
    });

    socket.on("message", (message) => {
      displayMessage(message);
      for (let i = 0; i < 20; i++) {
        $(".chat-icon").fadeOut(200).fadeIn(200);
      }
    });

    socket.on("load all messages", (data) => {
      data.forEach((message) => {
        displayMessage(message);
      });
    });

    // When the user leaves the page, send a 'left' message and disconnect the socket
    window.addEventListener('beforeunload', () => {
      socket.emit('left', { userName, userId });
      socket.disconnect();
    });
  }

  let displayMessage = (message) => {
    $("#chat").prepend(
      $("<li>").html(
        `<strong class="message ${getCurrentUserClass(message.user)}">${
          message.userName
        }</strong>: ${message.content}`
      )
    );
  };

  let getCurrentUserClass = (id) => {
    return userId === id ? "current-user" : "other-user";
  };
});



