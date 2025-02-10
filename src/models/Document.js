  const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Define User Schema
const DocSchema = new Schema({
    name: String,
    createdBy: String,
    content: { type: Object, default: {} },
    allowedUsers: [{
        emailId: { type: String, required: true },
        role: { type: String, required: true, enum: ['viewer', 'editor'] }
    }]
}, {
    collection: "Documents",
    timestamps:true
});

// Create Model
const DocModel = mongoose.model("Documents", DocSchema);
module.exports = DocModel;
