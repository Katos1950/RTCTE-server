const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDb = require("./src/Db");
const authRoutes = require("./src/routes/AuthRoutes");

const app = express();

connectDb();

app.use(cors());
app.use(express.json());

app.use("/users", authRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Auth Server running on port ${port}`);
});
