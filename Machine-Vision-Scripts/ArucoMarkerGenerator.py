import qrcode
import base64

saving = True

qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=1,
)

def generateQRCode(data):

    # Generate image
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    if saving == True:
        img.save("qrcode.png")
    
    # Encode into base64
    with open("qrcode.png", "rb") as image_file:
        encodedString = base64.b64encode(image_file.read())

    return encodedString
