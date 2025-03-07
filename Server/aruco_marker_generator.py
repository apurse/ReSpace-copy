import qrcode
import base64
from io import BytesIO

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
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    encodedString = base64.b64encode(buffered.getvalue()).decode("utf-8")

    return encodedString
