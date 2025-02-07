class Furniture:
    def __init__(self, furniture_id, size, locationX, locationY):
        """
        Initialises a Furniture instance.

        Args:
            furniture_id (str): Unique identifier for the furniture item.
            size (tuple): Size of the furniture object in length & width (cm).
            locationX (float): x coordinates of furniture item.
            locationX (float): y coordinates of furniture item.
        """
        self.id = furniture_id
        self.size = size
        self.locationX = locationX
        self.locationY = locationY
