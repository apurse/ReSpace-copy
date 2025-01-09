import cv2
import cv2.aruco as aruco
import numpy as np

# Choose the marker dictionary
aruco_dict = aruco.getPredefinedDictionary(aruco.DICT_6X6_250)
parameters = aruco.DetectorParameters()

# Adjust detector parameters for improved accuracy
parameters.adaptiveThreshConstant = 7
parameters.cornerRefinementMethod = aruco.CORNER_REFINE_SUBPIX

# Open a connection to the camera
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open camera.")
    exit()

print("Press 'q' to exit.")

while True:
    # Capture frame-by-frame
    ret, frame = cap.read()

    if not ret:
        print("Error: Couldn't read the frame.")
        break

    # Get frame dimensions and calculate center
    frame_height, frame_width = frame.shape[:2]
    frame_center_x, frame_center_y = frame_width // 2, frame_height // 2

    # Convert frame to grayscale for marker detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect markers
    corners, ids, _ = aruco.detectMarkers(gray, aruco_dict, parameters=parameters)

    if ids is not None:
        # Draw detected markers on the frame
        aruco.drawDetectedMarkers(frame, corners, ids)

        for i, marker_id in enumerate(ids.flatten()):
            # Get marker corners and calculate the center point
            marker_corners = corners[i].reshape((4, 2))
            marker_center_x = int(marker_corners[:, 0].mean())
            marker_center_y = int(marker_corners[:, 1].mean())

            # Calculate coordinates relative to the frame center
            relative_x = marker_center_x - frame_center_x
            relative_y = frame_center_y - marker_center_y  # Invert Y for a standard Cartesian system

            # Draw the center point of the marker
            cv2.circle(frame, (marker_center_x, marker_center_y), 5, (0, 255, 0), -1)

            # Draw the frame center
            cv2.circle(frame, (frame_center_x, frame_center_y), 5, (255, 0, 0), -1)

            # Print marker info
            print(f"Marker ID: {marker_id}")
            print(f"Marker Center: x={marker_center_x}, y={marker_center_y}")
            print(f"Relative to Frame Center: x={relative_x}, y={relative_y}")

    # Display the frame with annotations
    cv2.imshow('Aruco Marker Detection', frame)

    # Exit the loop when 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the camera and close windows
cap.release()
cv2.destroyAllWindows()