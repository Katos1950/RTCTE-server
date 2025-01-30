const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors"); 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
require("dotenv").config()

const Schema = mongoose.Schema;

// Define User Schema
const UserSchema = new Schema({
    userName: String,
    emailId: String,
    password: String
}, {
    collection: "Users"
});

// Create Model
const UserModel = mongoose.model("User", UserSchema);

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/RTCTE")
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", function() {
    console.log("We're connected!");
});

app.use(cors()); // Enable CORS globally
app.use(express.json()); 

// Define Port
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log("Node.js listening on port " + port);
});

// API Route to Find User by Email
app.get("/users/find/:query", async (req, res) => {
    try {
        const query = req.params.query;
        const result = await UserModel.find({ emailId: query });

        if (result.length > 0) {
            res.json(result);
        } else {
            res.status(404).json({ error: "No records found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// app.post("/users",async (req,res)=>{
//     try{
//         const salt = await bcrypt.genSalt()
//         const hashedPassword = await bcrypt.hash(req.body.password,salt)
//         console.log(hashedPassword)
//         const user = {userName: req.body.userName, emailId: req.body.emailId, password: hashedPassword}
//         console.log(user)
//         res.status(201).send()
//     }
//     catch{
//         res.status(500).send()
//     }
// })

app.post("/users/signUp",async (req,res)=>{
    const existingUser = await UserModel.findOne({ emailId: req.body.emailId });
    if (existingUser) {
        return res.status(400).send("User exists! Please log in.");
    }

    try{
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password,salt)
        const newUser = new UserModel({
            userName: req.body.userName,
            emailId: req.body.emailId, 
            password: hashedPassword
        })
        await newUser.save();
        res.status(200).send("User Created")        
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: error.message });
    }

})

app.post("/users/login", async (req, res) => {
    try {
        // Ensure email and password are provided
        if (!req.body.emailId || !req.body.password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Retrieve user by email
        const user = await UserModel.findOne({ emailId: req.body.emailId });

        // Check if user exists
        if (!user) {
            return res.status(400).json({ error: "User does not exist" });
        }

        // Compare hashed passwords
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Incorrect password" });
        }


        //new video
        const accessToken = jwt.sign(user.emailId,process.env.ACCESS_TOKEN_SECRET) 

        // Login successful
        return res.status(200).json({ message: "Login successful", accessToken : accessToken });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});




