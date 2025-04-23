import os
import base64
from PIL import Image


def convertToPNG(pgmFile):
    """
    Converts the .pmg map file into a .png file and base64 string.
    Args:
        link (str): The file path for the .pmg map.

    Returns:
        encodedString [string]: The .png image converted into a base64 string.
    """
    
    # Get the file and format it as .png
    filename, extension  = os.path.splitext(pgmFile)
    pngFile = "{}.png".format(filename)
    
    # Save image into directory as png
    with Image.open(pgmFile) as im:
        im.save(pngFile)
    
    # Encode the saved image into base64
    with open(pngFile, "rb") as image_file:
        encodedString = base64.b64encode(image_file.read()).decode("utf-8")

    print(encodedString)
    remove_img(pngFile)

    return encodedString


def remove_img(pngFile):
    """
    Remove the image saved from the directory
    Args:
        pngFile (str): The file path for the .png image.
    """
    
    # check if the file exists and remove
    if os.path.exists(pngFile):
        os.remove(pngFile)
        print("Removed!")

# convertToPNG(r'outside_lab.pgm')