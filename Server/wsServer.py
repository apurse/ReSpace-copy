"""Echo server using the asyncio API."""
"""From: https://websockets.readthedocs.io/en/stable/"""
"""SETUP:pip install asyncio websockets"""
"""Uni network may not be friendly to this"""

import asyncio
from websockets.asyncio.server import serve


async def echo(websocket):
    async for message in websocket:
        print(message)
        await websocket.send("message is:"  + message)


async def main():
    print("Hosting server on loacalhost:8002 ")
    async with serve(echo, "localhost", 8002) as server:
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())