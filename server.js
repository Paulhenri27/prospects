
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { getXataClient } = require("./src/xata");

const app = express();
const xata = getXataClient();

// Middleware
app.use(cors());
app.use(express.json());

// Define the valid API key (use .env for production)
const VALID_API_KEY = process.env.API_KEY || "your-secure-api-key";

// Middleware to check API key
const validateApiKey = (req, res, next) => {
  const clientApiKey = req.headers["x-api"];
  if (!clientApiKey || clientApiKey !== VALID_API_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid API key" });
  }
  next();
};

// Add API key validation middleware to all routes
app.use(validateApiKey);

// Endpoint to add a user
app.post("/users", async (req, res) => {
  const { email, number } = req.body;

  // Validate request data
  if (!email || !number) {
    return res.status(400).json({ error: "Email and number are required" });
  }

  try {
    // Save user to Xata
    const user = await xata.db.Users.create({
      email,
      number: parseInt(number, 10),
    });

    res.status(201).json({ message: "User added successfully!", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add user" });
  }
});

// Endpoint to get all users (optional)
app.get("/users", async (req, res) => {
  try {
    const users = await xata.db.Users.getAll();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = app;

