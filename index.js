const express = require("express");
const { v4: uuidv4 } = require('uuid');
var session = require('express-session');
const { createServer } = require("http");
const { Server } = require("socket.io");
var SQLiteStore = require('connect-sqlite3')(session);


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'cat in the hat',
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.db', dir: './db' })
}));

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
  socket.sessionID = randomId();
  socket.userID = randomId();
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