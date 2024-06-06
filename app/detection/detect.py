import os

from torchvision.transforms import ToTensor
import numpy as np
import onnxruntime as ort
import tempfile
import json
from PIL import Image
from Nudenet import NudityDetector
import sys

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
ALCOHOL_MODEL_PATH = os.path.join(MODEL_DIR, 'alcohol.onnx')
WEAPONS_MODEL_PATH = os.path.join(MODEL_DIR, 'model1.onnx')

def has_detection_above_threshold(image_data, alcohol_model_path, weapons_model_path, threshold=0.7):
    # Convert FormData image to JPG format
    image_data = image_data.convert("RGB")

    # Save the uploaded image temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        image_data.save(temp_file.name)
        temp_file_path = temp_file.name

    nudity_detected = NudityDetector(temp_file_path)

    # Detect alcohol and weapons
    im = Image.open(temp_file_path)
    im = im.resize((640, 640))
    im_data = ToTensor()(im)[None]
    size = np.array([[640, 640]], dtype=np.int64)

    alcohol_sess = ort.InferenceSession(alcohol_model_path)
    alcohol_output = alcohol_sess.run(
        output_names=None,
        input_feed={'images': im_data.data.numpy(), "orig_target_sizes": size}
    )
    alcohol_labels, _, alcohol_scores = alcohol_output
    alcohol_detected = any(alcohol_scores[0] > threshold)

    weapons_sess = ort.InferenceSession(weapons_model_path)
    weapons_output = weapons_sess.run(
        output_names=None,
        input_feed={'images': im_data.data.numpy(), "orig_target_sizes": size}
    )
    weapons_labels, _, weapons_scores = weapons_output
    weapons_detected = any(weapons_scores[0] > threshold)

    return {
        'nudity_detected': int(nudity_detected),
        'alcohol_detected': int(alcohol_detected),
        'weapons_detected': int(weapons_detected)
    }

if __name__ == "__main__":
    image_path = sys.argv[1]
    threshold = float(sys.argv[2])
    image_data = Image.open(image_path)
    result = has_detection_above_threshold(image_data, ALCOHOL_MODEL_PATH, WEAPONS_MODEL_PATH, threshold)
    print(json.dumps(result))
