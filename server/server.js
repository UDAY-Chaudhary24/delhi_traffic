const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("client"));

/**
 * Mock route generator for demo
 */
app.post("/api/route", (req, res) => {
  const { start, end, preference } = req.body;

  let route = [];
  let reason = "";
  let totalTime = "";

  if (preference === "cheaper") {
    route = [
      `Walk from ${start} to nearest Metro Station`,
      "Take Metro to destination zone",
      `Bus or shared auto to ${end}`
    ];

    reason =
      "This route prioritizes low-cost transport like metro and bus, minimizing auto usage.";

    totalTime = "55 minutes";
  } else {
    route = [
      `Auto from ${start} to nearest Metro Station`,
      "Take Metro for the longest stretch",
      `Auto directly to ${end}`
    ];

    reason =
      "This route minimizes unsafe walking and overcrowded buses, prioritizing metro and direct auto travel.";

    totalTime = "40 minutes";
  }

  res.json({
    route,
    totalTime,
    reason
  });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
