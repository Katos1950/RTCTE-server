const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDb = require("./src/Db");

const userRoutes = require("./src/routes/UserRoutes");
const documentRoutes = require("./src/routes/DocumentRoutes");

const app = express();

connectDb();

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/users", documentRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
