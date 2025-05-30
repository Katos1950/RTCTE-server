const express = require("express");
const DocModel = require("../models/Document");
const authenticateToken = require("../AuthMiddleware")

const router = express.Router();

// Get User's Documents
router.get("/documents", authenticateToken, async (req, res) => {
    try {
        const docsCreated = await DocModel.find({ 
            $or: [
                { createdBy: req.user.emailId },
                { allowedUsers: { $elemMatch: { emailId: req.user.emailId } } }
              ]
         });
        res.status(200).json(docsCreated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//create a new document
router.post("/createNewDoc",authenticateToken,async (req,res)=>{
    try{
        const newDoc = new DocModel({
            name:req.body.name,
            content:{},
            createdBy:req.user.emailId
        });

        await newDoc.save();

        res.status(201).json(newDoc);
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
})

router.delete("/documents/del",authenticateToken, async (req,res)=>{
    try{
        const result = await DocModel.deleteOne({
            name:req.body.name,
            createdBy:req.user.emailId
        })

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Entry not found" });
        }

        res.status(200).json({message:"Entry deleted"})
        
    }
    catch(error){
        res.status(500).json({error:error.message})
    }
})

router.put("/documents/rename",authenticateToken, async (req,res)=>{
    try{
        const result = await DocModel.updateOne(
            {name:req.body.name,
            createdBy:req.user.emailId},
            { $set: { name: req.body.newName } } 
        )
        
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Entry not found" });
        }

        res.status(200).json({message:"Entry updated"})
        
    }
    catch(error){
        res.status(500).json({error:error.message})
    }
})

router.post("/allowUser", authenticateToken, async (req, res) => {
    try {
        const { documentId, emailId, role } = req.body;

        if (!documentId || !emailId || !role) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (!["viewer", "editor"].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        const document = await DocModel.findById(documentId);

        if(document.allowedUsers.some(user => user.emailId === emailId))
            return res.status(400).json({error:"The user already has access to the document"})

        document.allowedUsers.push({ emailId, role });
        await document.save();

        res.status(200).json({ message: "User added successfully", document });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
