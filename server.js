const nodemailer = require('nodemailer')
const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer");
const { json } = require('body-parser');
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

const trnasporter = nodemailer.createTransport({
    port: 465,
    host: 'smtp.gmail.com',
    auth:{
        user:  'technicalrk078@gmail.com',
        pass: 'esliogpdnveyonid'  
    },
    secure: true
})

app.get("/:room", (req, res) =>{
    res.render("index", {
        roomId: req.params.room
    })
})


app.post("/send-mail", (res, req) =>{
    const to = req.body.to
    const url = req.body.url
    const mailData = {
        from: 'technicalrk078@gmail.com',
        to: to,
        subject: 'Join The video Chat with Me...',
        html: `<p>Hello</p><p>Came and join for the video chat</p><p>Here Click the link ${url}</p>`
    }
    trnasporter.sendMail(mailData, (error, info)=>{
        if(error){
            return console.log(error)
        }
        res.status(200).send({
            message: 'invitation sent', 
            message_id: info.messageId
        })
    })
})

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit('user-connected', userId);
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

server.listen(3030);
