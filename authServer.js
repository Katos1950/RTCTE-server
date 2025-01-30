const express = require("express");
const cors = require("cors"); 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const connectDb = require("./src/Db")
require("dotenv").config()
const UserModel = require("./src/User")
const DocModel = require("./src/Document")
const RefTokModel = require("./src/RefreshToken")

const app = express();

//connect to db
connectDb();


app.use(cors()); // Enable CORS globally
app.use(express.json()); 

// Define Port
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log("Node.js listening on port " + port);
});


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


        const accessToken = generateAccessToken(user) 
        const refreshToken = jwt.sign(user.emailId,process.env.REFRESH_TOKEN_SECRET) 
        await RefTokModel.create({token: refreshToken})

        // Login successful
        return res.status(200).json({ message: "Login successful", accessToken : accessToken, refreshToken : refreshToken});

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

function generateAccessToken(user){
    return jwt.sign({emailId:user.emailId},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"1m"}) 
}

app.post("/users/token",async (req,res)=>{
    const refreshToken = req.body.token;
    if(!refreshToken) return res.sendStatus(401)
    /*check if token exists in db if not return 403*/
    const storedToken = await RefTokModel.findOne({ token: refreshToken });
    if (!storedToken) return res.sendStatus(403);
    
    jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET, (err,user)=>{
        const accessToken = generateAccessToken({emailId:user.emailId})
        res.json({accessToken: accessToken})
    })
})

app.delete("/users/logout", async (req,res)=>{
    const refToken = await RefTokModel.deleteOne({token : req.body.token})
    res.sendStatus(204)
})


