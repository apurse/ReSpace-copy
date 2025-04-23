import cv2
import numpy as np
import math
import serial
import time

# Set up serial communication
try:
    ser = serial.Serial('COM6', 115200, timeout=1)
    time.sleep(2)  # Allow time to initialize
except serial.SerialException as e:
    print(f"Serial connection failed: {e}")
    ser = None

# Initialize camera
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    raise IOError("Cannot open webcam")

# Frame setup
frame_size = 640
radius = frame_size // 2
center = (frame_size // 2, frame_size // 2)
center_zone_radius = 40
detector = cv2.QRCodeDetector()

# Helper functions
def get_angle(center, point):
    dx = point[0] - center[0]
    dy = center[1] - point[1]
    return math.degrees(math.atan2(dy, dx)) % 360

def point_in_segment(center, point, segment_start, segment_end, radius):
    angle = get_angle(center, point)
    distance = np.linalg.norm(np.array(point) - np.array(center))
    if segment_start > segment_end:
        in_angle = angle >= segment_start or angle < segment_end
    else:
        in_angle = segment_start <= angle < segment_end
    return in_angle and distance <= radius

segment_4_start_time = None
segment_4_sent = False


# Main loop
try:
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame.")
            continue

        frame = cv2.resize(frame, (frame_size, frame_size))
        frame = cv2.flip(frame, 1)
        mask = np.zeros((frame_size, frame_size), dtype=np.uint8)
        cv2.circle(mask, center, radius, 255, -1)
        masked_frame = cv2.bitwise_and(frame, frame, mask=mask)

        data, points, _ = detector.detectAndDecode(masked_frame)

        if points is not None:
            points = points[0].astype(int)
            for i in range(4):
                cv2.line(masked_frame, tuple(points[i]), tuple(points[(i + 1) % 4]), (0, 255, 0), 2)

            cx = int(np.mean(points[:, 0]))
            cy = int(np.mean(points[:, 1]))
            qr_center = (cx, cy)
            cv2.circle(masked_frame, qr_center, 5, (0, 0, 255), -1)

            dist_to_center = np.linalg.norm(np.array(qr_center) - np.array(center))

            if dist_to_center <= center_zone_radius:
                segment = 4
            elif point_in_segment(center, qr_center, 270, 30, radius):
                segment = 1
            elif point_in_segment(center, qr_center, 30, 150, radius):
                segment = 2
            elif point_in_segment(center, qr_center, 150, 270, radius):
                segment = 3
            else:
                segment = 0  # Unknown

            print(f"Segment: {segment}")

            current_time = time.time()

            if segment == 4:
                if segment_4_start_time is None:
                    segment_4_start_time = current_time
                elif not segment_4_sent and (current_time - segment_4_start_time >= 3):
                    if ser:
                        try:
                            ser.write("4\n".encode())
                            print("Segment 4 sent")
                            segment_4_sent = True
                        except serial.SerialException as e:
                            print(f"Serial write failed: {e}")
            else:
                segment_4_start_time = None
                segment_4_sent = False
            if segment != 4 and segment != 0:
                if ser:
                    try:
                        ser.write(f"{segment}\n".encode())
                    except serial.SerialException as e:
                        print(f"Serial write failed: {e}")

        # Draw segment dividers
        for angle in [270, 30, 150]:
            x = int(center[0] + radius * math.cos(math.radians(angle)))
            y = int(center[1] - radius * math.sin(math.radians(angle)))
            cv2.line(masked_frame, center, (x, y), (255, 255, 255), 2)

        # Draw center zone
        cv2.circle(masked_frame, center, center_zone_radius, (255, 255, 0), 2)

        cv2.imshow("QR Segment Detection", masked_frame)

        key = cv2.waitKey(10) & 0xFF
        if key == ord('q'):
            break

except KeyboardInterrupt:
    print("Interrupted by user.")

finally:
    cap.release()
    cv2.destroyAllWindows()
    if ser:
        ser.close()








