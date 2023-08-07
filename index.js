const express = require("express");
const { v4: uuidv4 } = require('uuid');
var session = require('express-session');
const { createServer } = require("http");
const { Server } = require("socket.io");
const sqlite3  = require("sqlite3").verbose();
const {open} =require("sqlite");
 
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'cat in the hat',
  resave: false,
  saveUninitialized: false,
}));

(async () => {
  const db = await open({
    filename : './db/database.db',
    driver : sqlite3.cached.Database,
  });
})();

const httpServer = createServer(app);
const io = new Server(httpServer, { 
    cors: {
        origin: "http://127.0.0.1:5500"
      }
});

io.use((socket, next) => {
  console.log('middlewear socket');
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    console.log('found session id '+sessionID);
    // find existing session
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      return next();
    }//end of if session
  }
  const username = socket.handshake.auth.username;
  if (!username) {
    console.log('invalid username ');
    return next(new Error("invalid username"));
  }
  // create new session
  socket.sessionID = uuidv4();
  socket.userID = uuidv4();
  console.log("random uid "+socket.userID);
  socket.username = username;
  next();
});

io.on("connection", (socket) => {
  // ...
  console.log("Connection " + socket.id); 
  socket.emit("session" , {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  socket.on('userlogin', (data)=>{
    console.log("data is "+ JSON.stringify(data));
  })
});

httpServer.listen(3000);