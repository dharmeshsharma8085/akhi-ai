
from PIL import Image
import pytesseract

image = Image.new("RGB", (700, 120), "white")

from PIL import ImageDraw
draw = ImageDraw.Draw(image)
draw.text((20, 35), "AKHI AI OCR TEST 123", fill="black")

text = pytesseract.image_to_string(image)

print("OCR result:")
print(repr(text))
