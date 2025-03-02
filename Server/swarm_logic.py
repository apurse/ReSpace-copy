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


async def swarm_logic():
    await asyncio.sleep(2)
    print("Swarm Logic is running alongside the hub.")
    furniture_to_move = []

    while True:
        await asyncio.sleep(5)
        robots = hub.get_connected_robots()
        closest_funiture = None
        desired_furniture = None

        # Check if any furniture actually needs moving
        for cf in hub.get_current_furniture_positions():
            for df in hub.get_desired_furniture_positions():
                if distance(cf.locationX, cf.locationY, df.locationX, df.locationY) > 5:
                    furniture_to_move.append(cf.id)

        if len(furniture_to_move) == 0:
            continue

        for robot in robots.values():
            # Skip if robot is busy
            if robot.current_activity != "idle":
                continue
            print("robot: ", robot.to_dict())
            prev = np.inf
            # give first robot closest funiture location
            for funiture in hub.get_current_furniture_positions():
                if funiture.id not in furniture_to_move:
                    continue
                dist = distance(robot.locationX,robot.locationY,funiture.locationX,funiture.locationY)
                if dist < prev:
                    closest_funiture = funiture
                    prev = dist
                    for desired in hub.get_desired_furniture_positions():
                        if desired.id == closest_funiture.id:
                            desired_furniture = desired

            if (closest_funiture is not None) and (desired_furniture is not None):
                # Update the current furniture item
                hub.get_current_furniture_positions().remove(closest_funiture)
                hub.get_current_furniture_positions().append(desired_furniture)
                await robot.send_move_task(closest_funiture,desired_furniture)

        furniture_to_move.clear()

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
    except Exception as ex:
        # Reboot if crashed
        print(ex)
        await main()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Swarm Logic and Hub Communication shutting down.")
