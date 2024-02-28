const express = require("express");
const { runWebScrapping } = require("./webScrapping/puppeteerScraping");

const app = express();
const PORT = process.env.PORT || 3000;
const API_PATH = "/api/homes";

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.get(API_PATH, async (req, res, next) => {
  try {
    const city = req.query.city;

    // Check if the 'city' query parameter is missing
    if (!city) {
      return res.status(400).json({ error: 'The "city" query parameter is required' });
    }

    const houses = await runWebScrapping(city);
    res.json({ houses });
  } catch (error) {
    // Pass the error to the next middleware for centralized error handling
    next(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
