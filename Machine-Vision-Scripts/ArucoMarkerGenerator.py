import cv2
import cv2.aruco as aruco

# Set the ArUco dictionary (you can choose others, e.g., DICT_4X4_50)
aruco_dict = aruco.getPredefinedDictionary(aruco.DICT_6X6_250)

# Input the ID to encode in the marker
marker_id = int(input("Enter the ID for the ArUco marker (0 - 249): "))

# Check if the ID is within the range of the dictionary
if 0 <= marker_id < 250:
    # Generate the marker
    marker_size = 200  # Marker size in pixels
    marker_image = aruco.generateImageMarker(aruco_dict, marker_id, marker_size)

    # Save the marker image
    filename = f"aruco_marker_id_{marker_id}.png"
    cv2.imwrite(filename, marker_image)
    print(f"Aruco marker with ID {marker_id} saved as {filename}")

    # Optionally, display the generated marker
    cv2.imshow("Generated ArUco Marker", marker_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
else:
    print("Invalid ID! Please enter a number between 0 and 249.")
