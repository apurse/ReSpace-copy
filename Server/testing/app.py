import asyncio
import websockets
import json

# Todo: Just for testing until app websockets are reworked
async def send_message(uri: str):
    msg = {
        "type": "control",
        "target_id": "c7fa6217-5e9a-4ea9-9ed0-ac29cc405169",
        "direction": "forward"
    }
    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket server. Type your messages below:")
        try:
            while True:
                direction = input("Enter a direction: \n")
                msg["direction"] = direction

                await websocket.send(json.dumps(msg))
                print(f"Message sent: {json.dumps(msg)}")
        except KeyboardInterrupt:
            print("Disconnected from server.")

if __name__ == "__main__":
    server_uri = "ws://respace-hub.local:8002/app"
    asyncio.run(send_message(server_uri))