const mongoose = require("mongoose");

const ConnectDB = async ()=>{
    try{
        // Connect to MongoDB
        await mongoose.connect("mongodb://localhost:27017/RTCTE")
        .then(() => console.log("Connected to MongoDB"))
        .catch(err => console.error("MongoDB connection error:", err));
        
        const db = mongoose.connection;
        db.on("error", console.error.bind(console, "Connection error:"));
        db.once("open", function() {
            console.log("We're connected!");
        });
    }
    catch{
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

module.exports = ConnectDB;