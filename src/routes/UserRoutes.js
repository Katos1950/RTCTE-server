const express = require("express");
const bcrypt = require("bcrypt");
const UserModel = require("../models/User");
const authenticateToken = require("../AuthMiddleware")

const router = express.Router();

// Find User by Email
router.get("/find",authenticateToken, async (req, res) => {
    try {
        const email = req.query.emailId;
        const result = await UserModel.find({ emailId:email });

        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ error: "No records found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Sign Up User
router.post("/signUp", async (req, res) => {
    const existingUser = await UserModel.findOne({ emailId: req.body.emailId });
    if (existingUser) {
        return res.status(400).send({emailId:"User exists! Please log in."});
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const newUser = new UserModel({
            userName: req.body.userName,
            emailId: req.body.emailId,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).send("User Created");
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get("/profile",authenticateToken, async (req,res)=>{
    try {
        const user = await UserModel.findOne({ emailId: req.user.emailId });
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            emailId: user.emailId,
            userName: user.userName,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
