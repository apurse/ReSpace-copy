"""SETUP: pip install asyncio websockets --break-system-packages"""

import asyncio
from os.path import expanduser
import ssl

import numpy as np
import websockets.asyncio
import json

from PIL import Image
from websockets import serve
import socket
from io import BytesIO
import base64, zlib
from matplotlib import cm

from qr_generator import generateQRCode
from map_generator import convertToPNG
from robot import Robot
from furniture import Furniture

host = "0.0.0.0"
port = 8002

connected_app = None
connected_robots = {}
current_furniture_positions = []
desired_furniture_positions = []

# Only expose the hub interface object for other scripts
__all__ = ["hub"]

class HubInterface:
    """Public interface to interact with the hub communication system."""

    async def main(self):
        await main()

    def get_connected_robots(self):
        """
        Retrieve the currently connected robots.

        Returns:
            robot (dict): A dictionary of Robot objects that are currently connected.
        """
        return connected_robots

    def get_current_furniture_positions(self):
        """
        Retrieve the current furniture positions.

        Returns:
            list[Furniture]: A list of Furniture objects representing the current layout.
        """
        return current_furniture_positions

    def get_desired_furniture_positions(self):
        """
        Retrieve the desired furniture positions.

        Returns:
            list[Furniture]: A list of Furniture objects representing the desired layout.
        """
        return desired_furniture_positions

    async def send_to_robot(self, target_id, data):
        """
        Sends a message to a specific robot via WebSocket.

        Sends json data to the specified `target_id`.
        If no matching robot is found, a warning message is printed.

        Args:
            target_id (str): The unique identifier (UUID) of the target robot.
            data (dict): The message payload to send, which will be serialised to JSON.
        """
        await send_to_robot(target_id, data)

    async def send_to_app(self, message):
        await send_to_app(message)

# Create a single instance of the interface
hub = HubInterface()

async def handle_connection(websocket):
    global connected_app
    connected_ip = websocket.local_address[0]
    robot = None

    # Check based on incoming path if its app or robot connecting
    path = websocket.request.path
    client_type = path.lstrip("/")

    # Assign app websocket or add robot object to list
    if client_type == "app":
        # Limit to only one app connection at a time
        if connected_app is None:
            connected_app = websocket
            print(f"App successfully connected with IP: {connected_ip}")
        else:
            # Todo: Add a force overwrite of the connected_app websocket
            print(f"App attempted to connect with IP: {connected_ip}")
            print(f"Error: App already connected with IP: {connected_app.remote_address[0]}")
            return
        await update_apps_robot_list()

    elif client_type == "robot":
        robot = Robot(str(websocket.id), websocket)
        connected_robots[robot.id] = robot
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
                await handle_app_message(data)
            elif client_type == "robot":
                await handle_robot_message(robot, data)
    except websockets.ConnectionClosed:
        pass
    finally:
        # Clean up and disconnect when connection closed or exited
        if client_type == "app":
            print(f"App disconnected with ip {connected_ip}")
            connected_app = None
        elif client_type == "robot":
            print(f"Disconnected from: {connected_ip}")
            connected_robots.pop(robot.id)
            await update_apps_robot_list()


async def handle_app_message(data):
    # Emergency stop
    if data["type"] == "emergency_stop":
        # for loop to iterate over each robot
        print("emergency stop called")
        for robot in connected_robots.keys():
            print(robot)
            await send_to_robot(robot, data)
              
    elif data["type"] == "control":
        print("App control data: ", data)
        # Forward the task to the target robot
        target_robot_id = data["target"]
        await send_to_robot(target_robot_id, data)

    # Manually setting current furniture with the app
    elif data["type"] == "current_layout":
        current_furniture_positions.clear()
        for locationData in data["locations"]:
            print("Adding current data: ", locationData)
            furniture_id = locationData["id"]
            # size = locationData["size"] # Todo: setup size
            furniture_size = (1, 1)
            furniture_locationX = locationData["x"]
            furniture_locationY = locationData["y"]
            fun = Furniture(furniture_id, furniture_size, furniture_locationX, furniture_locationY)
            current_furniture_positions.append(fun)


    elif data["type"] == "desired_layout":
        desired_furniture_positions.clear()
        for locationData in data["locations"]:
            print("Adding desired data: ", locationData)
            furniture_id = locationData["id"]
            # size = locationData["size"] # Todo: setup size
            furniture_size = (1, 1)
            furniture_locationX = locationData["x"]
            furniture_locationY = locationData["y"]
            fun = Furniture(furniture_id, furniture_size, furniture_locationX, furniture_locationY)
            desired_furniture_positions.append(fun)


    elif data["type"] == "power":
        target_robot_id = data["target"]
        await send_to_robot(target_robot_id, data)

    elif data["type"] == "latency_test":
        await send_to_app({"type": "latency_test", "start_time": data["start_time"]})

    elif data["type"] == "new_furniture":
        print(data["data"])
        base64_string = generateQRCode(data["data"]) # Use qr code generation script
        # print(base64_string)
        await send_to_app({"type": "new_furniture", "base64": base64_string})
        
    elif data["type"] == "room_map":
        print(data["data"])
        base64_string = convertToPNG('outside_lab.pgm') # Change to map provided by robots
        # print(base64_string)
        await send_to_app({"type": "room_map", "base64": base64_string})

    elif data["type"] == "get_map":
        target_robot_id = data["target"]
        await send_to_robot(target_robot_id, data)

    elif data["type"] == "set_mode":
        for robot in connected_robots.keys():
            print(robot)
            await send_to_robot(robot, data)

    elif data["type"] == "load_map":
        # target_robot_id = data["target"]
        for robot in connected_robots.keys():
            print(robot)
            await send_to_robot(robot, data)

    else:
        print("Received unknown command!")
        print("Unknown data: ", data)
        

async def handle_robot_message(robot, data):
    if data["type"] == "status_update":
        # print("Received status update: ", data)
        # Forward status to the app
        # robot.battery = data["battery"] # Todo: add battery (probably read from arduino using ros status_update node)
        robot.battery = 69
        robot.locationX = data["locationX"]
        robot.locationY = data["locationY"]
        # robot.current_activity = data["current_activity"]
        robot.carrying = data["carrying"]
        # print("carrying", data["carrying"])
        robot.angle = data["angle"]
        # connected_robots[robot.id] = robot
        # print("Updating robot status: ", robot.to_dict())
        await update_apps_robot_list()
        # await robot.send_status_to_app()

    elif data["type"] == "furniture_location":
        print("Todo: furniture location")

    elif data["type"] == "scanning_map":

        # Extract both map and costmap data
        map_block = data["data"]["map"]
        map_comp_str = map_block["grid"]
        map_comp = base64.b64decode(map_comp_str)
        map_decomp = zlib.decompress(map_comp)

        resolution = map_block["meta"]["resolution"]
        origin = map_block["meta"]["origin"]["position"]
        originX = origin["x"]
        originY = origin["y"]
        map_height = map_block["meta"]["height"]

        costmap_block = data["data"]["costmap"]
        costmap_comp_str = costmap_block["grid"]
        costmap_comp = base64.b64decode(costmap_comp_str)
        costmap_decomp = zlib.decompress(costmap_comp)

        # Get width and heights for both map and costmap
        mw, mh = map_block["meta"]["width"], map_block["meta"]["height"]
        cw, ch = costmap_block["meta"]["width"], costmap_block["meta"]["height"]

        # Ensure width and heights match for map and costmap
        if (mw, mh) != (cw, ch):
            print("map & costmap dimensions must match")

        # rebuild NumPy arrays from the raw bytes
        map_arr = np.frombuffer(map_decomp, dtype=np.int8).reshape((mh, mw))
        cost_arr = np.frombuffer(costmap_decomp, dtype=np.uint8).reshape((ch, cw))

        # Render static map in grayscale
        base = np.zeros((mh, mw), dtype=np.uint8)
        base[map_arr == 0] = 254  # free -> light
        base[map_arr == 100] = 0  # occupied -> dark
        base[map_arr == -1] = 205  # unknown -> mid-gray
        base_img = Image.fromarray(base).transpose(Image.Transpose.FLIP_TOP_BOTTOM)

        # Colourise the costmap with a colourmap
        norm = cost_arr.astype(float) / (cost_arr.max() or 1.0)
        cmap = cm.get_cmap('PuBu') # Set to PuBu colour scheme (Options: https://matplotlib.org/stable/users/explain/colors/colormaps.html)
        colored_float = cmap(norm)  # returns H×W×4 array of floats
        colored = (colored_float[:, :, :3] * 255).astype(np.uint8)  # drop alpha & scale
        cost_img = Image.fromarray(colored).transpose(Image.Transpose.FLIP_TOP_BOTTOM)

        base_rgb = base_img.convert("RGB")
        cost_rgb = cost_img.convert("RGB")

        # Ensure two maps are the same size
        if base_rgb.size != cost_rgb.size:
            print(f"Size mismatch: base={base_rgb.size}, costmap={cost_rgb.size}")
            # Resize costmap to match
            cost_rgb = cost_rgb.resize(base_rgb.size, Image.Resampling.NEAREST)
            print(f"Resized costmap to {cost_rgb.size}")

        # Blend the two maps
        overlay = Image.blend(base_rgb, cost_rgb, alpha=0.6)

        map_x = int((robot.locationX - originX) / resolution)
        map_y = int((robot.locationY - originY) / resolution)
        # print("Location x:", robot.locationX)
        # print("Location y:", robot.locationY)

        pixel_x = map_x
        pixel_y = map_height - map_y

        marker = Image.open("robot.png").convert("RGBA")
        # Todo: change to size of map height or width divided by a certain value
        marker = marker.resize((32, 32), Image.Resampling.LANCZOS)
        marker = marker.rotate(robot.angle * 180/3.14)
        overlay_rgba = overlay.convert("RGBA")
        mx = pixel_x - marker.width // 2
        my = pixel_y - marker.height // 2

        overlay_rgba.paste(marker, (mx, my), marker)

        # Use for debugging
        overlay_rgba.save("new_map.png")

        # # Change to base64
        buffered = BytesIO()
        overlay_rgba.save(buffered, format="PNG")
        encoded_string = base64.b64encode(buffered.getvalue()).decode("utf-8")
        await send_to_app({"type": "scanning_map", "base64": encoded_string})

    elif data["type"] == "debug":
        print("Received debug message: ", data)

    elif data["type"] == "set_map":
        print("Received scan message: ", data)
        await send_to_app(data)


    else:
        print("Received unknown command!")
        print("Unknown data: ", data)



async def send_to_robot(target_id, data):
    print("Target ID: ", target_id)
    print("Data: ", connected_robots.keys())
    if target_id in connected_robots.keys():
        print(f"Forwarding: \n{data}\nto robot: {target_id}")
        await connected_robots[target_id].websocket.send(json.dumps(data))
    else:
        print(f"Robot {target_id} not found!")


async def send_to_app(message):
    """
    Sends a json message to the connected app via WebSocket.

    If app is not connected, a warning message is printed.

    Args:
        message (dict): The message payload to send, which will be serialised to json.
    """
    # print(f"Sending message to app:\n {message}")
    if connected_app is not None:
        await connected_app.send(json.dumps(message))
    else:
        print(f"Error: App not connected!")


async def update_apps_robot_list():
    if connected_app is not None and len(connected_robots) != 0:
        try:
            message = json.dumps({
                "type": "robot_list",
                "robots": [robot.to_dict() for robot in connected_robots.values()]
            })
            # print(f"Sending message to app: {message}")
            await connected_app.send(message)
        except Exception as e:
            print(f"Failed to update app with robot list: {e}")
    elif connected_app is not None:
        try:
            message = json.dumps({
                "type": "robot_list",
                "robot_ids": "None"
            })
            # print(f"Sending message to app: {message}")
            await connected_app.send(message)
        except Exception as e:
            print(f"Failed to update app with robot list: {e}")
    else:
        print(f"Error: App not connected!")

# SSL TURORIAL
# https://rob-blackbourn.medium.com/secure-communication-with-python-ssl-certificate-and-asyncio-939ae53ccd35

async def main():
    hostname = socket.gethostname()
    # print(f"Server running at ws://{hostname}:{port}")
    print(f"Server running at wss://respace-hub.duckdns.org:8002")
    
    
    # Setup SSL context info
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(
        expanduser("keys/fullchain.pem"),
        expanduser("keys/server.key"),
    )

    # Run server with connection details
    async with serve(handle_connection, host, port, ssl=context):
        try:
            await asyncio.Future()  # Keeps the server running
        except asyncio.CancelledError:
            print("\nShutting down server...")


if __name__ == "__main__":
    asyncio.run(main())