"""
Wants:

input:
List of connected robots and their status (Location)
current furniture positions
desired furniture positions
Receive Start from app

output:
Send message to specific robot

"""

import asyncio
from hub_communication import *

async def swarm_logic():
    await asyncio.sleep(2)
    print("Controller is running alongside the hub.")

    while True:
        robots = get_connected_robots()
        print("Connected Robots:", list(robots.keys()))

        if robots:
            target_robot_id = list(robots.keys())[0]
            await send_to_robot(target_robot_id, {"type": "control", "direction": "forward"})

        await asyncio.sleep(5)  # Wait before sending another command


async def main():
    server_task = asyncio.create_task(hub_main())  # Start the WebSocket server
    controller_task = asyncio.create_task(swarm_logic())  # Run the swarm logic

    try:
        await asyncio.gather(server_task, controller_task)  # Run both tasks concurrently
    except asyncio.CancelledError:
        print("Shutting down gracefully...")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Swarm Logic and Hub Communication shutting down.")
