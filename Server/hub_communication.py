"""SETUP: pip install asyncio websockets --break-system-packages"""

import asyncio
import websockets.asyncio
import json
from websockets import serve
import socket

host = "0.0.0.0"
port = 8002

connected_app = None
connected_robots = {}
furniture_positions = set()

async def handle_connection(websocket):
    # Get IP and subsequent hostname
    connected_ip = websocket.local_address[0]
    connection_id = websocket.id
    print(f"Address: {websocket.local_address[0]}")
    print(f"Latency: {websocket.latency}")
    print(f"ID: {connection_id}")

    # Check based on incoming path if its app or robot connecting
    path = websocket.request.path
    client_type = path.lstrip("/")

    # Assign app websocket or add robot to dictionary
    if client_type == "app":
        # Limit to only one app connection at a time
        global connected_app
        if connected_app is None:
            connected_app = websocket
            print(f"App successfully connected with IP: {connected_ip}")
        else:
            print(f"App attempted to connect with IP: {connected_ip}")
            print(f"Error: App already connected with IP: {connected_app.remote_address[0]}")
            return
        await update_apps_robot_list()
    elif client_type == "robot":
        connected_robots[connection_id] = websocket
        await update_apps_robot_list()
        print(f"Robot successfully connected with ip: {connected_ip}")
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
            print(f"App disconnected with ip {connected_ip}")
            connected_app = None
        elif client_type == "robot":
            print(f"Disconnected from: {connected_ip}")
            connected_robots.pop(connection_id)
            await update_apps_robot_list()

async def handle_app_message(websocket, data):
    if data["type"] == "control" or data["type"] == "status":
        print("Data: ", data)
        # Forward the task to the target robot
        target_robot_id = data["target_id"]
        await forward_to_robot(target_robot_id, data)

    # Manually setting current furniture with the app
    elif data["type"] == "current_layout":
        locations = data["locations"]
        print(f"Current layout locations: {locations}")
        #Todo: Store locally, offer up information for swarm script

    elif data["type"] == "desired_layout":
        locations = data["locations"]
        print(f"Desired layout locations: {locations}")
    else:
        print("Received unknown command!")
        print("Unknown data: ", data)

async def handle_robot_message(websocket, data):
    if data["type"] == "status":
        if data["target"] == "app":
            print(f"Received status update from {data['robot_id']}:\n{data}")
            if data["battery"] < 20: # Example of logic based on status we can do
                print(f"Robot {data['robot_id']} low battery warning: {data['battery']}%")
            # Forward status to all connected apps
            # Todo: Uncomment when officially testing with live app
            # await forward_to_app(data)


async def forward_to_robot(target_id, data):
    for robot_id, robot in connected_robots.items():
        # print(f"Forwarding: \n{data}\nto robot: {robot_id}")
        print(f"Robot ID: {robot_id}")
        print(f"Target ID: {target_id}")
        if str(robot_id) == target_id:
            await robot.send(json.dumps(data))
            break
    else:
        print(f"Robot {target_id} not found!")

async def forward_to_app(message):
    if connected_app is not None:
        await connected_app.send(json.dumps(message))
    else:
        print(f"App not connected!")

async def update_apps_robot_list():
    if connected_app is not None:
        try:
            message = json.dumps({
                "type": "robot_list",
                "robot_ids": [str(key) for key in connected_robots.keys()]
            })
            print(f"Sending message to app: {message}")
            await connected_app.send(message)
        except Exception as e:
            print(f"Failed to update app with robot list: {e}")

async def main():
    hostname = socket.gethostname()
    print(f"Server running at ws://{hostname}:{port}")

    async with serve(handle_connection, host, port):
        try:
            await asyncio.Future()  # Keeps the server running
        except asyncio.CancelledError:
            print("\nShutting down server...")

if __name__ == "__main__":
    asyncio.run(main())