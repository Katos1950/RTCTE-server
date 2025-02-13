const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");
const RefTokModel = require("../models/RefreshToken");

const router = express.Router();

function generateAccessToken(user) {
    return jwt.sign({ emailId: user.emailId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1m" });
}

// Login User
router.post("/login", async (req, res) => {
    try {
        if (!req.body.emailId || !req.body.password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await UserModel.findOne({ emailId: req.body.emailId });

        if (!user) {
            return res.status(400).json({ emailId: "User does not exist" });
        }

        if(!user.isVerified){
            return res.status(400).json({ emailId: "User is not verified" });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ password: "Incorrect password" });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign({ emailId: user.emailId }, process.env.REFRESH_TOKEN_SECRET);

        await RefTokModel.create({ token: refreshToken });

        return res.status(200).json({ message: "Login successful", accessToken, refreshToken });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Token Refresh
router.post("/token", async (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) return res.sendStatus(401);

    const storedToken = await RefTokModel.findOne({ token: refreshToken });
    if (!storedToken) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken(user);
        res.json({ accessToken });
    });
});

// Logout User
router.delete("/logout", async (req, res) => {
    await RefTokModel.deleteOne({ token: req.body.token });
    res.sendStatus(204);
});

router.get("/verify/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.EMAIL_VERIFY_SECRET);

        // Find the user using emailId instead of _id
        const user = await UserModel.findOneAndUpdate(
            { emailId: decoded.emailId },  // Changed to emailId
            { isVerified: true }
        );

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        res.status(200).send("Email verified successfully!");
    } catch (error) {
        res.status(400).json({ error: "Invalid or expired token" });
    }
});

module.exports = router;
