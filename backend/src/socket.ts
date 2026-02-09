import { Server } from "socket.io";
import { Server as HttpServer } from "http";

export let io: Server;

export function setupSocket(httpServer: HttpServer) {
    const allowedOrigins = [
        "https://hack-event-silk.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000"
    ];

    io = new Server(httpServer, {
        path: "/socket.io",
        cors: {
            origin: (origin, callback) => {
                // Allow requests with no origin (like mobile apps or curl requests)
                if (!origin) return callback(null, true);

                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        // Broadcast updated count to all clients
        io.emit("activeUsers", io.engine.clientsCount);

        socket.on("disconnect", () => {
            io.emit("activeUsers", io.engine.clientsCount);
        });
    });
}
