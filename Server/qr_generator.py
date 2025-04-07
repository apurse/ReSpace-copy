import qrcode
import base64
from io import BytesIO
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# https://stackoverflow.com/questions/75152880/cannot-convert-np-array-from-bool-to-uint8-and-save-image-properly-with-opencv
# https://stackoverflow.com/questions/4902198/pil-how-to-scale-text-size-in-relation-to-the-size-of-the-image


saving = False

qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=1,
)


def generateArrow(qrCode):
    """
    Generate the arrow part of the qr code image.
    Args:
        qrCode (str): The cv2 qrCode 8-bit array.

    Returns:
        arrow [cv2 image]: The arrow image.
    """
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
    """
    Generate the qr code image from the furniture data.
    Args:
        data (JSON): The furniture data stored as a JSON file.

    Returns:
        encodedString [base64 string]: The QRCode image encoded into base64.
    """

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
    
    
    fontSize = 30
    name = (data["name"] + "_" + data["id"])
    
    
    # size relative to image
    img_fraction = 0.95
    font = ImageFont.truetype("arial.ttf", fontSize)
    
    
    # Decrease font size until the text fits
    while (font.getbbox(name)[2]) > (img_fraction * combined.width):
        fontSize -= 1
        font = ImageFont.truetype("arial.ttf", fontSize)


    # Create a background and add the combined image with text
    finalImage = Image.new('RGBA', (combined.width, combined.height + fontSize + 5), (255,255,255,255))
    draw = ImageDraw.Draw(finalImage)
    finalImage.paste(combined, (0,0))
    draw.text(((combined.width - font.getbbox(name)[2]) / 2, combined.height - 5), name, (0,0,0), font=font)


    if saving:
        print("Saving images to this directory")
        Image.fromarray(qrCode).save("qrImage.png")
        Image.fromarray(arrow).save("arrow.png")
        finalImage.save('final.png')


    # Change to buffer
    buffered = BytesIO()
    finalImage.save(buffered, format="PNG")
    encodedString = base64.b64encode(buffered.getvalue()).decode("utf-8")
    # print(encodedString)
    qr.clear()

    return encodedString

#generateQRCode({"name":"Black Chair", "id":"2"})
