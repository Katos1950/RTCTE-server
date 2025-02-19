const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Define User Schema
const RefTokSchema = new Schema({
    token : String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800 // Entry will be deleted 7 days after creation
      }
}, {
    collection: "RefreshTokens"
});

// Create Model
const RefTokModel = mongoose.model("RefreshTokens", RefTokSchema);
module.exports = RefTokModel;