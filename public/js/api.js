$(document).ready(() => {
    let apiToken = $("#apiToken").text(); // Get the API token from the HTML
    $("#modal-button").click(() => {
      $(".modal-body").html(""); // Clear the modal body
      $.get(`/api/events?apiToken=${apiToken}`, (results = {}) => {
        let data = results.data;
        if (!data || !data.events) return; // If there are no events, return
        data.events.forEach((event) => {
          // For each event, add it to the modal body with a join button
          $(".modal-body").append(`
          <div>
            <span class="event-title">${event.title}</span>
            <div class="event-description">${event.description}</div>
            <button class="join-button" data-id="${event._id}">Join</button>
          </div>`);
        });
      }).then(() => {
        addJoinButtonListener(apiToken); // Add a join button listener after the events are loaded
      });
    });
  });
  
  // Add a listener for join buttons that sends an AJAX request to the server to join a event
  let addJoinButtonListener = (token) => {
    $(".join-button").click((event) => {
      let $button = $(event.target),
        courseId = $button.data("id");
      $.get(`/api/events/${courseId}/join?apiToken=${token}`, (results = {}) => {
        let data = results.data;
        if (data && data.success) {
          $button
            .text("Joined")
            .addClass("joined-button")
            .removeClass("join-button"); // Update the join button text and style if the join was successful
        } else {
          $button.text("Try again"); // Update the join button text if the join failed
        }
      });
    });
  };
  