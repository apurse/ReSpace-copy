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
from hub_communication import hub

# Todo: Build this out, everything in this function is placeholder code
async def swarm_logic():
    await asyncio.sleep(2)
    print("Swarm Logic is running alongside the hub.")

    while True:
        robots = hub.get_connected_robots()
        print("Connected Robots:")
        for robot in robots:
            print(f"Robot Current Activity: {robot.current_activity}")
            print(robot.id)
            robot.current_activity = "moving"
            print("Setting to moving!")

        if robots:
            robot = robots[0]
            print(f"Robot Current Activity: {robot.current_activity}")
            await robot.move_to(10, 20)
            # await hub.send_to_robot(target_robot_id, {"type": "control", "direction": "forward"})
            print(f"Current furniture positions:")
            for furniture in hub.get_current_furniture_positions():
                print(f"Furniture: {furniture.id} - x: {furniture.locationX} y: {furniture.locationY}")



        await asyncio.sleep(5)  # Wait before sending another command


async def main():
    hub_communication_task = asyncio.create_task(hub.main())  # Start the WebSocket server
    swarm_task = asyncio.create_task(swarm_logic())  # Run the swarm logic

    try:
        await asyncio.gather(hub_communication_task, swarm_task)  # Run both tasks concurrently
    except asyncio.CancelledError:
        print("Shutting down gracefully...")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Swarm Logic and Hub Communication shutting down.")
