import asyncio
import websockets.asyncio
import json
import socket
import serial

serial_port = "/dev/ttyACM0"
baud_rate = 9600

# Robot configuration
robot_id = socket.gethostname().split('.')[0]
hub_uri = "ws://ReSpace-Hub.local:8002/robot"
status_update_interval = 20  # Seconds
reconnect_interval = 5  # Seconds

# Todo: Turn these into variables that are updated when location data is obtained
# Example status message to send periodically
status_message = {
    "type": "status",
    "target": "app",
    "robot_id": robot_id,
    "is_connected": True,
    "battery": 15,
    "location": {"x": 60, "y": 10},
    "current_activity": "idle"
    }

async def connect_to_server():
    while True:
        try:
            async with websockets.connect(hub_uri) as websocket:
                print(f"Connected to server at {hub_uri} as {robot_id}")

                # Start a background task to send periodic status updates
                asyncio.create_task(send_status_updates(websocket))

                # Listen for incoming commands
                await handle_hub_message(websocket)

        except websockets.ConnectionClosed as e:
            print(f"Connection closed: {e}")
        except Exception as e:
            print(f"An error occurred: {e}")
        print("Connection lost: attempting to reconnect...")
        await asyncio.sleep(reconnect_interval)

async def send_status_updates(websocket):
    try:
        while True:
            # Send the status message
            await websocket.send(json.dumps(status_message))
            print("Status update sent:", status_message)

            # Wait before sending the next update
            await asyncio.sleep(status_update_interval)
    except websockets.ConnectionClosed:
        print("Stopped sending status updates: Connection closed")

async def handle_hub_message(websocket):
    try:
        async for message in websocket:
            # Parse the incoming message
            data = json.loads(message)

            # Handle control commands (forward, backward, left, right, raise, lower)
            if data.get("type") == "control":
                handle_control_command(data)
            else:
                print("Unknown command received!")
    except websockets.ConnectionClosed:
        print("Connection closed from hub")

def handle_control_command(command):
    try:
        direction = command["direction"]
        target = command["target"]

        print("Control command received!")
        # Yes it references itself in the log message,
        # this might help when we're reading logs of 2 or more devices
        print(f"Sending \"{direction}\" direction to {target}'s arduino!")
        arduino.write((direction + ";").encode())
    except:
        print("Error in writing to arduino")

if __name__ == "__main__":
    arduino = serial.Serial(serial_port, baud_rate)
    print(f"connected to arduino, serial port {serial_port}")
    try:
        print(f"Starting robot client ({robot_id})...")
        asyncio.run(connect_to_server())
    except KeyboardInterrupt:
        print("\nConnection closed!")
