"""Echo server using the asyncio API."""
"""From: https://websockets.readthedocs.io/en/stable/"""
"""SETUP:pip install asyncio websockets --break-system-packages"""
"""Uni network may not be friendly to this"""

import asyncio
from websockets.asyncio.server import serve
import json

host = "localhost"
port = 8002


# async def echo(websocket):
#     async for message in websocket:
#         print(message)
#         await websocket.send("message is:"  + message)


async def handle_connection(websocket):
    print("Client connected.")
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                print("Received:", data)

                # Example response
                response = {"type": "response", "message": "Hello from server!"}
                await websocket.send(json.dumps(response))
            except json.JSONDecodeError:
                print("Error decoding JSON.")
                await websocket.send(json.dumps({"error": "Invalid JSON format"}))
    except websockets.exceptions.ConnectionClosed as e:
        print("Connection closed:", e)


async def start():
    print("Hosting server on " + host + ":" + str(port))
    async with serve(handle_connection, host, port) as server:
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(start())