const http = require('http');
const mongoose = require('mongoose');
const Document = require('./src/models/Document');
const connectDb = require("./src/Db");

connectDb();
//new
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
      origin: "https://co-write.online",
      methods: ["GET", "POST"],
      credentials: true
    },
    path: "/editor/socket.io" 
  });
  
  app.use(cors());

let activeUsers={}

io.on("connection", socket => {
    let userEmail = null; 
    
    socket.on("get-document", async ({ documentId, emailId }) => {
        if (!documentId) return;
        
        let document = await Document.findById(documentId);
        if (!document) {
            document = await Document.create({ _id: documentId, content: "" });
        }    

        const userPermission = document.allowedUsers.find(user => user.emailId === emailId);
        let isEditor = userPermission && (userPermission.role === "editor");
        const isViewer = userPermission && (userPermission.role === "viewer");
        if(document.createdBy===emailId)
            isEditor=true;

        socket.join(documentId);

        if(!activeUsers[documentId]) {
            activeUsers[documentId]= new Set();
        }
        activeUsers[documentId].add(emailId)
        userEmail = emailId;
        console.log(activeUsers)
        io.to(documentId).emit("update-active-users", Array.from(activeUsers[documentId]));


        socket.emit("load-document", {content:document.content,isEditor,isViewer});

        socket.on("send-changes", delta => {
            socket.broadcast.to(documentId).emit("receive-changes", delta);
        });

        try{
            socket.on("save-document", async content => {
                await Document.findByIdAndUpdate(documentId, { content });
            });
        }
        catch(error){
            console.log(error)
        }

        socket.on("send-cursor", ({ emailId, range }) => {
            socket.broadcast.to(documentId).emit("receive-cursor", { emailId, range });
          });             
    });

    socket.on("disconnect", () => {
        console.log(`User ${userEmail} disconnected`);
    
        if (userEmail) {
            for (let documentId in activeUsers) {
                if (activeUsers[documentId].has(userEmail)) {
                    // Then, remove the user from activeUsers
                    activeUsers[documentId].delete(userEmail);
                    console.log(`Removed ${userEmail} from document ${documentId}`);
                    // Update active users list in the UI
                    io.to(documentId).emit("remove-cursor", userEmail);
                    io.to(documentId).emit("update-active-users", Array.from(activeUsers[documentId]));
                }
            }
        }
    });
});
server.listen(3001, '0.0.0.0', () => {
    console.log('Socket.IO server running on port 3001');
  });