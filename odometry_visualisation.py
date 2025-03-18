import serial.tools.list_ports
import serial
import pygame
import math

port = 'COM6'
baudrate = 9600
timeout = 0.1
try: # try to form a connection between serial port 
    connection = serial.Serial(port=port, baudrate=baudrate, timeout=timeout)
    print(f'Connected to {port} at {baudrate} baud.')
except serial.SerialException as e: #print if connection failed
    print(f'Failed to connect to {port}: {e}')
    connection = None
            
# function to read from the serial port
def serial_read():
    if connection and connection.in_waiting > 0:
        return connection.readline().decode().strip()

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
running = True
printChecker = 0
while running:
    data = serial_read()
    data_parts = data.split(" ")
    screen.fill(BACKGROUND_COLOR)
    
    if len(data_parts) == 3:
        try:
            x, y, angle = float(data_parts[0]) *100, float(data_parts[1]) *100, float(data_parts[2])*100
            draw_arrow(screen, x, y, angle)
            # if printChecker<100:
            #     printChecker += 1
            # else:
            print(x,y,angle)
            # printChecker=0
        except ValueError:
            print("Error - invalid data")
            pass  # Ignore invalid data
    
    pygame.display.flip()
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

pygame.quit()