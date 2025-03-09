import qrcode
import base64
from io import BytesIO
import cv2
import numpy as np
from PIL import Image

# https://stackoverflow.com/questions/75152880/cannot-convert-np-array-from-bool-to-uint8-and-save-image-properly-with-opencv

saving = False

qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=1,
)

# Make arrow image
def generateArrow(qrCode):
    arrow = Image.new('RGB', (qrCode.shape[0], int(qrCode.shape[1] / 1.5)), (255,255,255))
    arrow = np.array(arrow)


    # Arrow Options
    startPoint = (int(qrCode.shape[0] / 2), int(arrow.shape[0] - 20))
    endPoint = (int(qrCode.shape[0] / 2), 20)
    colour = (0,0,0)
    thickness = 20
    headWidth = 0.6


    # Draw arrow
    arrow = cv2.arrowedLine(arrow, startPoint, endPoint, colour, thickness, tipLength=headWidth)

    return arrow



def generateQRCode(data):

    # Generate QR code image
    qr.add_data(data)
    qr.make(fit=True)
    qrCode = qr.make_image(fill_color="black", back_color="white")


    # Convert qrCode into 8 bit np array with RGB
    qrCode = np.array(qrCode).astype(dtype='uint8') * 255
    qrCode = cv2.cvtColor(qrCode, cv2.COLOR_BGR2RGB)


    # Get arrow
    arrow = generateArrow(qrCode)
    

    # Combine images using np and convert to PIL
    combined = np.vstack((arrow, qrCode))
    combined = Image.fromarray(combined)
    

    if saving:
        print("Saving images to this directory")
        Image.fromarray(qrCode).save("qrImage.png")
        Image.fromarray(arrow).save("arrow.png")
        combined.save("combined.png")


    # Change to buffer
    buffered = BytesIO()
    combined.save(buffered, format="PNG")
    encodedString = base64.b64encode(buffered.getvalue()).decode("utf-8")

    return encodedString