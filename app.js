const express = require("express");
const { runWebScrapping } = require("./webScrapping/puppeteerScraping");

const app = express();
const port = 3000;

app.get("/api/homes", async (req, res) => {
  try {
    const city = req.query.city;

    // Check if the 'city' query parameter is missing
    if (!city) {
      return res.status(400).json({ error: 'The "city" query parameter is required' });
    }

    const houses = await runWebScrapping(city);
    res.json({ houses });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
