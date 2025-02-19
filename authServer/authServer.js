const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDb = require("../src/Db");
// Import Auth Routes
const authRoutes = require("../src/routes/AuthRoutes");

const app = express();

// Connect to DB
connectDb();

app.use(cors());
app.use(express.json());

// Use Routes
app.use("/users", authRoutes);

// Start Auth Server
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Auth Server running on port ${port}`);
});
