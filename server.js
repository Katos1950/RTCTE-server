const express = require("express");
const cors = require("cors"); 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const connectDb = require("./src/Db")
require("dotenv").config()
const UserModel = require("./src/User")
const DocModel = require("./src/Document")

const app = express();

//connect to db
connectDb();


app.use(cors()); // Enable CORS globally
app.use(express.json()); 

// Define Port
const port = process.env.PORT || 5000;
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


app.get("/users/documents",authenticateToken,async (req,res)=>{
    //res.json(docs.filter(doc => doc.createdBy === req.user.emailId))
    const docsCreated = await DocModel.find({ createdBy: req.body.emailId });
    res.status(200).send(docsCreated)
})

//middleware
function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    if(!token) return res.sendStatus(401)
    
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err) return res.sendStatus(403).json({ error: "Invalid or expired token" });
        req.user = user
        next()
    })
}




