from Server.furniture import Furniture
class Robot:
    def __init__(self, robot_id, websocket):
        """
        Initialises a Robot instance.

        Args:
            robot_id (str): Unique identifier for the robot.
            websocket (websockets.WebSocketClientProtocol): Websocket connection.
        """
        self.id = robot_id
        self.websocket = websocket
        self.battery = 100
        self.locationX = -1
        self.locationY = -1
        self.current_activity = "idle"
        self.carrying = None

    def send_status_to_app(self):
        """Sends the robot's current status to the app."""
        from hub_communication import hub
        status_message = {
            "type": "status",
            "robot_id": self.id,
            "battery": self.battery,
            "location": {"x": self.locationX, "y": self.locationY},
            "current_activity": self.current_activity,
        }
        hub.send_to_app(status_message)
        print(f"Status update sent: {status_message}")

    async def move_to(self, x, y):
        """Moves the robot to a new x/y location."""
        from hub_communication import hub
        self.current_activity = "moving"
        data = {"type": "move", "location": {"x": x, "y":  y}}
        await hub.send_to_robot(self.id, data)

    async def send_move_task(self, furniture_from, furniture_to):
        """
        Sends a task to move the robot to a new x/y location.

        Args:
            furniture_from (Furniture): The object of the current furniture.
            furniture_to (Furniture): The object of the desired furniture

        This updates the robot's "carrying" status to the furniture's ID and current_activity to "lifting".
        """
        from hub_communication import hub
        fromX = furniture_from.locationX
        fromY = furniture_from.locationY
        toX = furniture_to.locationX
        toY = furniture_to.locationY

        # furniture_from.
        # self.location = {"x": x, "y": y}
        self.current_activity = "moving"
        data = {"type": "move_task", "location_from": {"x": fromX, "y": fromY}, "location_to": {"x": toX, "y": toY}}
        await hub.send_to_robot(self.id, data)

    async def actuate_lift(self, furniture_id, direction):
        """
        Sends a command to actuate the robot's lift mechanism.

        Args:
            furniture_id (str): The ID of the furniture being lifted.
            direction (str): The direction of the lift movement (e.g., "raise" or "lower").

        This updates the robot's "carrying" status to the furniture's ID and current_activity to "lifting".
        """
        from hub_communication import hub
        self.carrying = furniture_id
        self.current_activity = "lifting"
        data = {"type": "control", "command": direction}
        await hub.send_to_robot(self.id, data)

    async def send_custom_data(self, data):
        """Sends handwritten JSON data to the robot."""
        from hub_communication import hub
        print(f"Sending data: {data}")
        await hub.send_to_robot(self.id, data)
