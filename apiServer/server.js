const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDb = require("../src/Db");

// Import Routes
const userRoutes = require("../src/routes/UserRoutes");
const documentRoutes = require("../src/routes/DocumentRoutes");

const app = express();

// Connect to DB
connectDb();

app.use(cors());
app.use(express.json());

// Use Routes
app.use("/users", userRoutes);
app.use("/users", documentRoutes);

// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
