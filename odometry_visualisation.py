import pygame
import math
import time
from serial_communication import SerialCommunication

odom = SerialCommunication(port='COM6', baudrate='115200')

# Initialize Pygame
pygame.init()

# Constants
WIDTH, HEIGHT = 800, 600
BACKGROUND_COLOR = (30, 30, 30)
ARROW_COLOR = (255, 0, 0)

# Create display
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Arrow Rotation")

# Arrow properties
arrow_length = 50
arrow_width = 10
angle = 0  # Change this to rotate the arrow

def transform_coordinates(x, y):
    return x + WIDTH // 2, HEIGHT // 2 - y

# Function to draw rotated arrow
def draw_arrow(surface, x, y, angle):
    x, y = transform_coordinates(x, y)
    
    # Convert angle to radians
    rad = math.radians(angle)
    
    # Define arrow points relative to the center
    tip = (x + arrow_length * math.cos(rad), y - arrow_length * math.sin(rad))
    left = (x + arrow_width * math.cos(rad + math.pi * 3/4), y - arrow_width * math.sin(rad + math.pi * 3/4))
    right = (x + arrow_width * math.cos(rad - math.pi * 3/4), y - arrow_width * math.sin(rad - math.pi * 3/4))
    
    # Draw arrow
    pygame.draw.polygon(surface, ARROW_COLOR, [tip, left, right])

# Main loop
data_buffer = 0
running = True
while running:
    data = odom.serial_read()
    print(data)

    if data_buffer < 10:
        data_buffer =+ 1
        data_parts = data.split(",")
    else:
        data_buffer = 0
        odom.connection.reset_input_buffer()
    

    screen.fill(BACKGROUND_COLOR)
    
    if len(data_parts) == 3:
        try:
            x, y, angle = float(data_parts[0]) * 100, float(data_parts[1]) * 100, float(data_parts[2]) * 100
            draw_arrow(screen, x, y, angle)
            # print(x, y, angle)
        except ValueError:
            print("Error - invalid data")
            pass  # Ignore invalid data
    
    pygame.display.update()  # Update only necessary parts
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

pygame.quit()