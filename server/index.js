import http from "http";
import express from "express";
import logger from "morgan";
import cors from "cors";
import {Server} from "socket.io";
// mongo connection
import "./config/mongo.js";
// socket configuration
import socketEvents from "./utils/WebSockets.js";
// routes
import indexRouter from "./routes/index.js";
import userRouter from "./routes/user.js";
import chatRoomRouter from "./routes/chatRoom.js";
import deleteRouter from "./routes/delete.js";
// middlewares
import { decode } from './middlewares/jwt.js'

const app = express();
const socket = new Server();

/** Get port from environment and store in Express. */
const port = process.env.PORT || "4000";
app.set("port", port);

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
app.use("/", indexRouter);
app.use("/users", userRouter);
app.use("/room", chatRoomRouter);
// app.use("/room", chatRoomRouter);
app.use("/delete", deleteRouter);

/** catch 404 and forward to error handler */
app.use('*', (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'API endpoint doesnt exist'
  })
});

//Enables CORS from client-side


/** Create HTTP server. */
const server = http.createServer(app);
/** Create socket connection */
global.io = socket.listen(server,{
  cors: {
    origin: '*',
    credentials: true
  }
});
// global.io.on('connection', WebSockets.connection)
socketEvents(global.io)
/** Listen on provided port, on all network interfaces. */
server.listen(port);
/** Event listener for HTTP server "listening" event. */
server.on("listening", () => {
  console.log(`Listening on port:: http://localhost:${port}/`)
});

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
//   res.header("Access-Control-Allow-Credentials", "true");
//   next();
// });