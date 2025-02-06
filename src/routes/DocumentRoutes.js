const express = require("express");
const DocModel = require("../models/Document");
const authenticateToken = require("../AuthMiddleware")

const router = express.Router();

// Get User's Documents
router.get("/documents", authenticateToken, async (req, res) => {
    try {
        const docsCreated = await DocModel.find({ createdBy: req.user.emailId });
        res.status(200).json(docsCreated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//create a new document
router.post("/createNewDoc",authenticateToken,async (req,res)=>{
    try{
        const newDoc = new DocModel({
            content:{},
            createdBy:req.user.emailId
        });
        newDoc.name = "DOC "+ newDoc._id
        await newDoc.save();

        res.status(201).json(newDoc);
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
})

module.exports = router;
