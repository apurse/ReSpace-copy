import cv2
import numpy as np

# Open a connection to the camera
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Error: Could not open camera.")
    exit()


# Initialize the QR code detector
qr_detector = cv2.QRCodeDetector()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: Couldn't read the frame.")
        break

    # Get frame dimensions and center
    frame_height, frame_width = frame.shape[:2]
    frame_center_x, frame_center_y = frame_width // 2, frame_height // 2

    # Draw a circle at the center of the frame
    cv2.circle(frame, (frame_center_x, frame_center_y), 10, (255, 0, 0), 2)

    # Detect QR code
    data, bbox, _ = qr_detector.detectAndDecode(frame)

    if bbox is not None and len(bbox) > 0:
        print("Centering: True")  # QR code detected
        bbox = bbox[0].astype(int)
        cv2.polylines(frame, [bbox], isClosed=True, color=(0, 255, 0), thickness=2)

        # Compute center of detected QR code
        qr_center_x = int(bbox[:, 0].mean())
        qr_center_y = int(bbox[:, 1].mean())

        # Relative position
        offset_x = qr_center_x - frame_center_x
        offset_y = frame_center_y - qr_center_y

        print(f"QR Code: Offset X: {offset_x}, Offset Y: {offset_y}")
        if data:
            print(f"Data: {data}")

        # Define a threshold for centering
        tolerance = 20  # Pixels
        if abs(offset_x) < tolerance and abs(offset_y) < tolerance:
            print("Scissor Lift Activate")
        else:
            print(f"Offset X: {offset_x}, Offset Y: {offset_y}")
    else:
        print("Centering: False")

    # Display frame (for debugging)
    cv2.imshow('QR Code Detection', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
