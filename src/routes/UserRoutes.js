const express = require("express");
const bcrypt = require("bcrypt");
const UserModel = require("../models/User");

const router = express.Router();

// Find User by Email
router.get("/find/:query", async (req, res) => {
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

// Sign Up User
router.post("/signUp", async (req, res) => {
    const existingUser = await UserModel.findOne({ emailId: req.body.emailId });
    if (existingUser) {
        return res.status(400).send("User exists! Please log in.");
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

module.exports = router;
