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

        socket.join(documentId);

        if(!activeUsers[documentId]) {
            activeUsers[documentId]= new Set();
        }
        activeUsers[documentId].add(emailId)
        userEmail = emailId;
        console.log(activeUsers)
        io.to(documentId).emit("update-active-users", Array.from(activeUsers[documentId]));


        socket.emit("load-document", document.content);

        socket.on("send-changes", delta => {
            socket.broadcast.to(documentId).emit("receive-changes", delta);
        });

        socket.on("save-document", async content => {
            await Document.findByIdAndUpdate(documentId, { content });
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
        if (userEmail) {
            // Iterate through active users and remove the user's email
            for (let documentId in activeUsers) {
                if (activeUsers[documentId].has(userEmail)) {
                    activeUsers[documentId].delete(userEmail);
                    console.log(`Removed ${userEmail} from document ${documentId}`);
                    io.to(documentId).emit("update-active-users", Array.from(activeUsers[documentId]));
                }
            }
        }
        console.log(activeUsers); // Log active users after disconnection
    });
});
