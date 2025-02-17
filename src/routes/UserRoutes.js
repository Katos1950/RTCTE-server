const express = require("express");
const bcrypt = require("bcrypt");
const UserModel = require("../models/User");
const authenticateToken = require("../AuthMiddleware")
const sendEmailVerification = require("../EmailVerification")
const router = express.Router();
const jwt = require("jsonwebtoken");
const sendPassResVerification = require("../ResetPassEmail")

const generateVerificationToken = (emailId) => {
    if (!emailId) {
        throw new Error("Email is required to generate a verification token");
    }
    return jwt.sign({ emailId }, process.env.EMAIL_VERIFY_SECRET, { expiresIn: "1h" });
};

const generateResetPassToken = (emailId) => {
    if (!emailId) {
        throw new Error("Email is required to generate a verification token");
    }
    return jwt.sign({ emailId }, process.env.PASS_RESET_SECRET, { expiresIn: "15m" });
};

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
        if (!existingUser.isVerified) {
            const deleteResult = await UserModel.deleteOne({ emailId: req.body.emailId });
        }
        else{
            return res.status(400).send({emailId:"User exists! Please log in."});
        }
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const newUser = new UserModel({
            userName: req.body.userName,
            emailId: req.body.emailId,
            password: hashedPassword,
            isVerified: false
        });

        await newUser.save();
        const token = generateVerificationToken(req.body.emailId)
        await sendEmailVerification(req.body.emailId,token)
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

router.post("/sendPassResetLink",async(req,res)=>{
    
    const emailId = req.body.emailId;
    const user = await UserModel.findOne({emailId:emailId})
    if(!user){
        return res.status(400).json({ emailId: "User not found" });
    }
    const token = generateResetPassToken(emailId)
    await sendPassResVerification(emailId,token)
    res.sendStatus(200)
})

router.post("/resetpassword",async (req,res)=>{
    try {
        const token = req.body.token;
        if (!token) return res.status(400).json({ error: "Token is missing" });
        const decoded = jwt.verify(token, process.env.PASS_RESET_SECRET);
        if (!decoded) return res.status(400).json({ error: "Invalid or expired token" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = await UserModel.findOneAndUpdate(
            { emailId: decoded.emailId },  
            { password:hashedPassword }
        );

        res.status(200).send("Password reset successfully!");
    } catch (error) {
        res.status(400).json({ error: "Invalid or expired token" });
    }
})

module.exports = router;
