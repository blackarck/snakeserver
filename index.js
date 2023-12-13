const express = require("express");
const { v4: uuidv4 } = require("uuid");
var session = require("express-session");
const { createServer } = require("http");
const { Server } = require("socket.io");
const dbhandle = require("./dbhandle");
const dbhelper = new dbhandle();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "cat in the hat",
    resave: false,
    saveUninitialized: false,
  })
);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://127.0.0.1:5500",
  },
});

io.use((socket, next) => {
  console.log("middlewear socket");
  const sessionID = socket.handshake.auth.authdata.sessionid;
  if (sessionID) {
    console.log("Input session id " + sessionID);
    // find existing session
    const session = dbhelper.findsession(sessionID);

    if (session) {
      console.log("Session is " + JSON.stringify(session));
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      return next();
    } //end of if session
  }
  console.log("Socket obj is " + JSON.stringify(socket.handshake));
  const username = socket.handshake.auth.authdata.username;
  if (!username) {
    console.log("invalid username ");
    return next(new Error("invalid username"));
  }
  // create new session
  socket.sessionID = uuidv4();
  socket.userID = uuidv4();
  //console.log("random uid " + socket.userID);
  socket.username = username;
  const data = dbhelper.insertsession({
    sessionid: socket.sessionID,
    userid: socket.userID,
    username: socket.username,
  });
  console.log("return after insert " + JSON.stringify(data));
  next();
});

io.on("connection", (socket) => {
  // ...
  console.log("Connection " + socket.id);
  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  socket.on("userlogin", (data) => {
    console.log("data1 is " + JSON.stringify(data));
  });

  socket.on("updatePosition",(data)=>{
    // broadcast it back to everyone 
   // console.log(" socketid is "+ socket.sessionID);
    socket.emit("getPosition",{
      userid: socket.userID,
      posdata: data
    }); // end of getposition
  }); //on updateposition
});

httpServer.listen(3000);
