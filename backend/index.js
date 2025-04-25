import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import passport from "passport";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import viewsRoutes from "./routes/viewsRoutes.js";
import blockedRoutes from "./routes/blockRoutes.js";
import reportedRoutes from "./routes/reportRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import http from "http";
import { Server } from "socket.io";
import { likeHandler } from "./sockets/likeHandler.js";
import { viewHandler } from "./sockets/viewHandler.js";
import { chatHandler } from "./sockets/chatHandler.js";
import { blockHandler } from "./sockets/blockHandler.js";
import { reportHandler } from "./sockets/reportHandler.js";
import { audioHandler } from "./sockets/audioHandler.js";
import { eventHandler } from "./sockets/eventHandler.js";
import pool from "./utils/db.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5001;

const server = http.createServer(app);
export const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
		credentials: true,
	},
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
	origin: ["http://localhost:3000"],
	credentials: true,
};
app.use(cors(corsOptions));

const sessionMiddleware = session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
	cookie: { 
		secure: false,
		httpOnly: true, 
		sameSite: "strict", 
		maxAge: 1000 * 60 * 60 * 24
}});


app.use(sessionMiddleware);

io.use((socket, next) => {
	sessionMiddleware(socket.request, {}, next);
});

export const users = {};

io.on("connection", async (socket) => {
	const userId = socket.request.session.userId;

	if (userId) {
		users[userId] = socket.id;
		await pool.query("UPDATE users SET is_connected = TRUE, last_connected_at = CURRENT_TIMESTAMP WHERE id = $1", [userId]);
	} else {
		socket.disconnect(true);
		return;
	}

	likeHandler(socket);
	viewHandler(socket);
	chatHandler(socket);
	blockHandler(socket);
	reportHandler(socket);
	audioHandler(socket);
	eventHandler(socket);

	socket.on("disconnect", async () => {
		delete users[userId];
		await pool.query("UPDATE users SET is_connected = FALSE, last_connected_at = CURRENT_TIMESTAMP WHERE id = $1", [userId]);
	});
	setTimeout(async () => {
		if (!users[userId]) {
			await pool.query("UPDATE users SET is_connected = FALSE, last_connected_at = CURRENT_TIMESTAMP WHERE id = $1",[userId]);
		}
	}, 5000);
});

app.use(passport.initialize());
app.use(passport.session());

app.get("/api/auth/status", async (req, res) => {
	if (req.session.userId) {
	  try {
		const result = await pool.query('SELECT onboarding FROM users WHERE id = $1', [req.session.userId]);
		const onboarding = result.rows[0];
		res.json({ authenticated: true, onboarding});
	  } catch (err) {
		console.error('error', err);
		res.status(500).json({ authenticated: false, error: 'server error' });
	  }
	} else {
	  res.json({ authenticated: false });
	}
 });

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/views", viewsRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/blocked", blockedRoutes);
app.use("/api/reported", reportedRoutes);
app.use("/api/events", eventRoutes);

server.listen(port, () => { console.log(`server start`) });
