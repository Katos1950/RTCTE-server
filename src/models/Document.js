const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Define User Schema
const DocSchema = new Schema({
    name: String,
    createdBy: String,
    content: String,
    allowedUsers:[]
}, {
    collection: "Documents"
});

// Create Model
const DocModel = mongoose.model("Documents", DocSchema);
module.exports = DocModel;
