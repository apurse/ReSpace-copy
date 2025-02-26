# VERY IMPORTANT, install this VV NOT rplidar
# pip install rplidar-sharpattack
# In the terminal
# cd ReSpace_3-24
# git clone https://github.com/simondlevy/BreezySLAM.git
# cd BreezySLAM/python
# Follow installing for python in: https://github.com/simondlevy/BreezySLAM (MacOS/Linux Only apparently)

from breezyslam.algorithms import RMHC_SLAM
import numpy as np
import matplotlib.pyplot as plt
from breezyslam.sensors import RPLidarA1  # or use a different model
from rplidar import RPLidar
import time

lidar = RPLidar('/dev/tty.usbserial-0001')
lidar.stop()
lidar.disconnect()
lidar = RPLidar('/dev/tty.usbserial-0001')

MAP_SIZE_PIXELS = 800

mapbytes = bytearray(MAP_SIZE_PIXELS*MAP_SIZE_PIXELS)

slam = RMHC_SLAM(RPLidarA1(), MAP_SIZE_PIXELS, 35)

# Function to read LiDAR data
def readLidar():
    time.sleep(1)
    scan_data = [0] * 360  # Pre-fill scan with zeros
    for i, scan in enumerate(lidar.iter_scans()):
        print(f'Scan {i}: {len(scan)} points')
        for point in scan:
            angle = point[1]
            distance = point[2]
            index = int(angle) % 360  # Ensure angle stays in range
            scan_data[index] = distance

        if len(scan_data) >= 360:
            return scan_data
        else:
            print(len(scan_data))
    return None

try:
    while True:
        try:
            print("bye")
            distances = readLidar()
            print(f"Distances: {distances}")

            if distances:
                slam.update(distances)

                # Get the current estimated position
                x, y, theta = slam.getpos()
                print(f"Position: x={x:.2f}, y={y:.2f}, theta={theta:.2f}")

                # Get the updated map
                slam.getmap(mapbytes)

                # Convert mapbytes to an image and display it
                map_array = np.array(mapbytes).reshape((MAP_SIZE_PIXELS, MAP_SIZE_PIXELS))

                # Update the live map visualisation
                plt.clf()  # Clear the previous frame
                plt.imshow(map_array, cmap="gray", origin="lower")
                plt.title(f"SLAM Map - Position: x={x:.2f}, y={y:.2f}")
                plt.draw()  # Force update
                plt.pause(0.01)  # Small pause to allow UI refresh
                print("HI")
        except Exception as e:
            print(f"Exception occured: {e}")
        finally:
              plt.show()

except KeyboardInterrupt:
    print(f"Shutting down LiDAR...")
    lidar.stop()
    lidar.disconnect()
