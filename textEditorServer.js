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

io.on("connection", socket => {
    socket.on("get-document", async documentId => {
        if (!documentId) return;
        
        let document = await Document.findById(documentId);
        if (!document) {
            document = await Document.create({ _id: documentId, content: "" });
        }
        
        socket.join(documentId);
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
    });
});
