const express = require("express");
const app = express();
const port = 3000;

app.get("/api/zillow", (req, res) => {
  try {
    const city = req.query.city;
    const houses = city;
    res.json({ houses });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
