const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Define User Schema
const RefTokSchema = new Schema({
    token : String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 20 // Entry will be deleted 120 seconds (2 minutes) after creation
      }
}, {
    collection: "RefreshTokens"
});

// Create Model
const RefTokModel = mongoose.model("RefreshTokens", RefTokSchema);
module.exports = RefTokModel;