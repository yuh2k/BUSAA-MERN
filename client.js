const jwt = require("jsonwebtoken");
const apiToken = "user_api_token";
// Get the API token
const token = jwt.sign({ apiToken }, process.env.JWT_SECRET);
const axios = require("axios");
// Set the headers for the API request
const headers = {
  Authorization: `Bearer ${token}`,
};
// Make the API request
axios.get("/api/events", { headers })
  .then((response) => {
    const events = response.data;
    const eventList = document.getElementById("event-list");
    eventList.innerHTML = "";
    events.forEach((event) => {
      const eventEl = document.createElement("div");
      eventEl.innerHTML = `
        <h2>${event.title}</h2>
        <p>${event.date}</p>
        <p>${event.location}</p>
        <p>${event.description}</p>
      `;
      eventList.appendChild(eventEl);
    });
  })
  .catch((error) => {
    console.log(error);
    const errorEl = document.getElementById("error");
    errorEl.innerHTML = `
      <p>Error: ${error.message}</p>
    `;
  });