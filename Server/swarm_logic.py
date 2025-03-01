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
import numpy as np
from hub_communication import hub


# Todo: Build this out, everything in this function is placeholder code
async def swarm_logic():
    await asyncio.sleep(2)
    print("Swarm Logic is running alongside the hub.")

    while True:

        await asyncio.sleep(5)
        robots = hub.get_connected_robots()
        for robot in robots:
            prev = np.inf
            # give first robot closest funiture location
            for funiture in hub.get_current_furniture_positions():
                distance = distance(robot.locationX,robot.locationY,funiture.locationX,funiture.locationY)
                if distance < prev:
                    closest_funiture = funiture
                    prev = distance
                    for desired in hub.get_desired_furniture_positions():
                        if desired.id == closest_funiture.id:
                            desired_furniture = desired

            robot.send_move_task(closest_funiture,desired_furniture)

# Testing the node com_handler connection
# async def test():
#     await asyncio.sleep(10)
#     while True:
#         for robot in hub.get_connected_robots():
#             print(f"Sending message \"Hello World\" to {robot.id}")
#             await robot.send_custom_data("Hello World")
#         await asyncio.sleep(10)


def distance(x1,y1,x2,y2):
    return np.sqrt(np.square(x2 - x1) + np.square(y2 - y1))


async def main():
    hub_communication_task = asyncio.create_task(hub.main())  # Start the WebSocket server
    swarm_task = asyncio.create_task(swarm_logic())  # Run the swarm logic
    # swarm_task = asyncio.create_task(test())
    try:
        await asyncio.gather(hub_communication_task, swarm_task)  # Run both tasks concurrently
    except asyncio.CancelledError:
        print("Shutting down gracefully...")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Swarm Logic and Hub Communication shutting down.")
