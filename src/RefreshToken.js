const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Define User Schema
const RefTokSchema = new Schema({
    token : String
}, {
    collection: "RefreshTokens"
});

// Create Model
const RefTokModel = mongoose.model("RefreshTokens", RefTokSchema);
module.exports = RefTokModel;