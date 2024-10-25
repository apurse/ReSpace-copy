import cv2
import cv2.aruco as aruco

aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_6X6_250)  # Choose the marker dictionary
parameters = aruco.DetectorParameters()
encoded_message = None

# Open a connection to the camera (0 is typically the default camera)
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open camera.")
else:
    print("Press 'q' to exit.")

# Loop to continuously capture frames
while True:
    # Capture frame-by-frame
    ret, frame = cap.read()

    # Check if frame is read correctly
    if not ret:
        print("Error: Couldn't read the frame.")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    corners, ids, _ = aruco.detectMarkers(gray, aruco_dict, parameters=parameters)

    if ids is not None:
        # Draw detected markers on the frame
        aruco.drawDetectedMarkers(frame, corners, ids)

        # Loop through detected marker IDs and print them
        for i, marker_id in enumerate(ids.flatten()):
            # Update encoded_message with the detected marker ID
            encoded_message = marker_id
            print(f"Detected Marker ID (Encoded Message): {encoded_message}")

            # Calculate the center point of each marker
            marker_corners = corners[i]
            x = int(marker_corners[0][:, 0].mean())
            y = int(marker_corners[0][:, 1].mean())
            print(f"Marker position: x={x}, y={y}")

            # Optionally, draw a circle at the center of each marker
            cv2.circle(frame, (x, y), 5, (0, 255, 0), -1)

        # Display the resulting frame
    cv2.imshow('Aruco Marker Detection', frame)

    # Exit the loop when 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the camera and close windows
cap.release()
cv2.destroyAllWindows()