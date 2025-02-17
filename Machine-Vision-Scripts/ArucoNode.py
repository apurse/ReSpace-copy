import cv2
import cv2.aruco as aruco
import numpy as np
import rospy
from std_msgs.msg import String, Bool

# Initialize ROS node
rospy.init_node('aruco_centering_node', anonymous=True)
centering_pub = rospy.Publisher('/aruco/centering', Bool, queue_size=10)
status_pub = rospy.Publisher('/aruco/status', String, queue_size=10)

# Choose the marker dictionary
aruco_dict = aruco.getPredefinedDictionary(aruco.DICT_6X6_250)
parameters = aruco.DetectorParameters()
parameters.adaptiveThreshConstant = 7
parameters.cornerRefinementMethod = aruco.CORNER_REFINE_SUBPIX

# Open a connection to the camera
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    rospy.logerr("Error: Could not open camera.")
    exit()

rospy.loginfo("Aruco detection node started. Press 'Ctrl+C' to exit.")

while not rospy.is_shutdown():
    ret, frame = cap.read()
    if not ret:
        rospy.logerr("Error: Couldn't read the frame.")
        break

    # Get frame dimensions and center
    frame_height, frame_width = frame.shape[:2]
    frame_center_x, frame_center_y = frame_width // 2, frame_height // 2

    # Convert frame to grayscale for marker detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    corners, ids, _ = aruco.detectMarkers(gray, aruco_dict, parameters=parameters)

    if ids is not None:
        centering_pub.publish(True)  # Aruco marker detected
        aruco.drawDetectedMarkers(frame, corners, ids)
        for i, marker_id in enumerate(ids.flatten()):
            marker_corners = corners[i].reshape((4, 2))
            marker_center_x = int(marker_corners[:, 0].mean())
            marker_center_y = int(marker_corners[:, 1].mean())

            # Relative position
            offset_x = marker_center_x - frame_center_x
            offset_y = frame_center_y - marker_center_y

            rospy.loginfo(f"Marker {marker_id}: Offset X: {offset_x}, Offset Y: {offset_y}")

            # Define a threshold for centering
            tolerance = 20  # Pixels
            if abs(offset_x) < tolerance and abs(offset_y) < tolerance:
                status_pub.publish("Scissor Lift Activate")
            else:
                status_pub.publish(f"Offset X: {offset_x}, Offset Y: {offset_y}")
    else:
        centering_pub.publish(False)
        status_pub.publish("Centering: False")

    # Display frame (for debugging)
    cv2.imshow('Aruco Detection', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Cleanup
cap.release()
cv2.destroyAllWindows()