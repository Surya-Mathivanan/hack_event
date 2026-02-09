import { Server } from "socket.io";
import { Server as HttpServer } from "http";

export let io: Server;

export function setupSocket(httpServer: HttpServer) {
    io = new Server(httpServer, {
        path: "/socket.io",
        cors: {
            origin: "*",
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
