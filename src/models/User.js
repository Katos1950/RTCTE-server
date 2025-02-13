const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Define User Schema
const UserSchema = new Schema({
    userName: String,
    emailId: String,
    password: String,
    isVerified: { type: Boolean, default: false } 
}, {
    collection: "Users"
});

// Create Model
const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
