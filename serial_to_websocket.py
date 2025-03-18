import asyncio
import websockets
import serial

SERIAL_PORT = "COM3"  # Pas dit aan naar je Arduino COM-poort
BAUD_RATE = 115200

async def send_serial_data(websocket, path):
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    while True:
        if ser.in_waiting > 0:
            data = ser.readline().decode("utf-8").strip()
            if data.startswith("TANK_POS") or data.startswith("GUN_ANGLE"):
                await websocket.send(data)  # Stuur tank en kanon feedback naar game.js
                print("📡 Verzonden naar game:", data)

async def main():
    server = await websockets.serve(send_serial_data, "localhost", 8765)
    print("🚀 WebSocket server gestart op ws://localhost:8765")
    await asyncio.Future()  # Houd de server draaiende

asyncio.run(main())
