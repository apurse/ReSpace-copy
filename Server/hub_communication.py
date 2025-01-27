import asyncio
import websockets.asyncio
import json
from websockets import serve
import socket

host = "localhost"
port = 8002

connected_apps = set()
connected_robots = set()
furniture_positions = set()

async def handle_connection(websocket):
    # Get IP and subsequent hostname
    connected_ip = websocket.remote_address[0]
    connected_hostname = socket.gethostbyaddr(connected_ip)[0]
    print(f"Successfully connected to: {connected_hostname} with ip: {connected_ip}")

    # Check based on incoming path if its app or robot connecting
    path = websocket.request.path
    client_type = path.lstrip("/")
    # Add connected app/robots to sets
    if client_type == "app":
        # Temporarily limit to only one app connection at a time
        if len(connected_apps) == 0:
            connected_apps.add(websocket)
        else:
            websocket.send("App already connected!")
            return
    elif client_type == "robot":
        connected_robots.add(websocket)
    else:
        await websocket.close()
        return

    try:
        # Wait for incoming message
        async for message in websocket:
            # Load message data
            data = json.loads(message)
            # Assign data to appropriate handler
            if client_type == "app":
                await handle_app_message(websocket, data)
            elif client_type == "robot":
                await handle_robot_message(websocket, data)
    except websockets.ConnectionClosed:
        pass
    finally:
        if client_type == "app":
            print(f"Disconnected from: {connected_hostname}")
            connected_apps.remove(websocket)
        elif client_type == "robot":
            print(f"Disconnected from: {connected_hostname}")
            connected_robots.remove(websocket)

async def handle_app_message(websocket, data):
    if data["type"] == "control" or data["type"] == "status":
        print("Data: ", data)
        # Forward the task to the target robot
        target_robot = data["target"]
        await forward_to_robot(target_robot, data)

    # Manually setting current furniture with the app
    elif data["type"] == "current_furniture":
        print("Todo")
        #Todo: Store locally, offer up information for swarm script

    elif data["type"] == "desired_furniture":
        print("Todo")
        #Todo: Store locally, offer up information for swarm script
    else:
        print("Received unknown command!")

async def handle_robot_message(websocket, data):
    if data["type"] == "status":
        if data["target"] == "app":
            print(f"Received status update from {data['robot_id']}:\n{data}")
            if data["battery"] < 20: # Example of logic based on status we can do
                print(f"Robot {data['robot_id']} low battery warning: {data['battery']}%")
            # Forward status to all connected apps
            # Todo: Uncomment when officially testing with live app
            # await forward_to_apps(data)


async def forward_to_robot(target_robot, data):
    for robot in connected_robots:
        robot_ip = robot.remote_address[0]
        robot_hostname = (socket.gethostbyaddr(robot_ip)[0])

        # lstrip(".") on hostname doesn't work, not sure why
        # Current solution is appending .broadband to target_robot
        target_robot = target_robot+".broadband"
        print(f"Forwarding: \n{data}\nto {target_robot}")
        if robot_hostname == target_robot:
            await robot.send(json.dumps(data))
            break
    else:
        print(f"Robot {target_robot} not found!")

async def forward_to_apps(message):
    for app in connected_apps:
        await app.send(json.dumps(message))

async def main():
    hostname = socket.gethostname()
    print(f"Server running at ws://{hostname}:{port}")

    async with serve(handle_connection, 'localhost', port):
        try:
            await asyncio.Future()  # Keeps the server running
        except asyncio.CancelledError:
            print("\nShutting down server...")

if __name__ == "__main__":
    asyncio.run(main())
