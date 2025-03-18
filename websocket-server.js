const { SerialPort } = require("serialport");
const WebSocket = require("ws");

const port = new SerialPort({ path: "COM3", baudRate: 115200 });
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
    console.log("Client connected");
    
  //arduino to websocket - game
    port.on("data", (data) => {
        const command = data.toString().trim();
        ws.send(command);
    });
    
   //game commands naar arduino
    ws.on("message", (message) => {
        console.log(`Received: ${message}`);
        port.write(message.toString());
    });
    
    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

console.log("🚀 WebSocket server started on ws://localhost:8080");