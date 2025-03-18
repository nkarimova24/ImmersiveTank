const { SerialPort } = require("serialport");
const WebSocket = require("ws");

const port = new SerialPort({ path: "COM3", baudRate: 115200 });
const wss = new WebSocket.Server({ port: 8080 });

let connectedClients = new Set();

port.on("error", (err) => {
    console.error("Serial port error:", err.message);
});

port.on("open", () => {
    console.log("Serial port opened successfully");
});

port.on("data", (data) => {
    const message = data.toString().trim();
    console.log("From Arduino:", message);
    
    for (const client of connectedClients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
});

wss.on("connection", (ws) => {
    console.log("Client connected");
    connectedClients.add(ws);
    
    ws.send("Connected to tank control server");
    
    ws.on("message", (message) => {
        const command = message.toString().trim();
        console.log("From client:", command);
        
        port.write(command + "\n", (err) => {
            if (err) {
                console.error("Error writing to serial port:", err.message);
            }
        });
    });
    
    ws.on("close", () => {
        console.log("Client disconnected");
        connectedClients.delete(ws);
    });
    
    ws.on("error", (err) => {
        console.error("WebSocket error:", err.message);
        connectedClients.delete(ws);
    });
});

console.log("🚀 WebSocket server running at ws://localhost:8080");