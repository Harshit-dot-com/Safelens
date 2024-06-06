import os
from flask import Flask, request, jsonify,render_template
from PIL import Image
from torchvision.transforms import ToTensor
from flask_cors import CORS
import numpy as np
import onnxruntime as ort
import tempfile
from Nudenet import NudityDetector
from datetime import datetime

app = Flask(__name__)
CORS(app, origins='*', allow_headers=['Content-Type'])

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

    # Detect nudity
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

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/detect', methods=['POST'])
def detect():
    threshold = 0.9

    # Retrieve image from FormData body
    image_file = request.files.get('image')

    if image_file:
        # Read the image file
        try:
            image_data = Image.open(image_file)
        except Exception as e:
            return jsonify({'error': str(e)})

        if image_file.filename.endswith('.jpg') or image_file.filename.endswith('.jpeg') or image_file.filename.endswith('.png'):
            # Detect nudity, alcohol, and weapons
            detection_info = has_detection_above_threshold(image_data, ALCOHOL_MODEL_PATH, WEAPONS_MODEL_PATH, threshold)
            
            # Calculate the final detection value
            final_detection = 1 if any(detection_info.values()) else 0
            detection_info['final_detection'] = final_detection
            return jsonify(detection_info)
        else:
            return jsonify({'error': 'Invalid file format'})
    else:
        return jsonify({'error': 'No file uploaded'})

if __name__ == '__main__':
    app.run(debug=False, use_reloader=False, host='0.0.0.0')
