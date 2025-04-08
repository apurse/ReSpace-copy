import asyncio
import websockets.asyncio
import json
import socket

host = socket.gethostname()

# Todo: Massive refactoring required, just for testing
async def send_message(uri: str):
    msg = {
  "type": "status",
  "target": "app",
  "position": {"x": 10, "y": 20},
  "battery": 90
}
    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket server. Type your messages below:")
        try:
            while True:
                input("Press enter to send data\n")
                await websocket.send(json.dumps(msg))
                print(f"Message sent: {json.dumps(msg)}")
        except KeyboardInterrupt:
            # await websocket.close(code=1000, reason="Normal closure")
            print("Disconnected from server.")

if __name__ == "__main__":
    print("Starting connection from: ", host)
    server_uri = (f"ws://ReSpace-Hub.local:8002/robot")
    asyncio.run(send_message(server_uri))