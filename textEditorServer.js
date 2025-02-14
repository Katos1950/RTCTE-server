const mongoose = require('mongoose');
const Document = require('./src/models/Document');
const connectDb = require("./src/Db");

connectDb();

const io = require("socket.io")(3001, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

let activeUsers={}

io.on("connection", socket => {
    let userEmail = null; // Variable to store the user's email
    
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

        socket.on("save-document", async content => {
            await Document.findByIdAndUpdate(documentId, { content });
        });

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
