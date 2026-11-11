from flask import Flask, request, send_file
import onnxruntime as ort
import numpy as np
from PIL import Image
import io
import os
import requests

app = Flask(__name__)

# Constants
MODEL_URL = "https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx"
MODEL_PATH = "/tmp/u2netp.onnx"

def download_model():
    """Download the model if it doesn't exist in /tmp"""
    if not os.path.exists(MODEL_PATH):
        print("Downloading model...")
        response = requests.get(MODEL_URL)
        with open(MODEL_PATH, "wb") as f:
            f.write(response.content)
        print("Model downloaded.")

def preprocess(image):
    """Preprocess image for U2Net"""
    # Resize to 320x320 (Standard for U2NetP)
    img = image.resize((320, 320), Image.BILINEAR)
    img = np.array(img, dtype=np.float32)
    
    # Normalize (Standard ImageNet mean/std)
    img = img / 255.0
    img[:, :, 0] = (img[:, :, 0] - 0.485) / 0.229
    img[:, :, 1] = (img[:, :, 1] - 0.456) / 0.224
    img[:, :, 2] = (img[:, :, 2] - 0.406) / 0.225
    
    # Transpose to (C, H, W) and add batch dim
    img = img.transpose((2, 0, 1))
    img = np.expand_dims(img, 0)
    return img

def postprocess(pred, original_size):
    """Postprocess prediction to alpha mask"""
    # Pred shape: (1, 1, 320, 320)
    pred = np.squeeze(pred)
    
    # Normalize 0-1
    ma = np.max(pred)
    mi = np.min(pred)
    pred = (pred - mi) / (ma - mi)
    
    # Resize back to original size
    mask = Image.fromarray((pred * 255).astype(np.uint8))
    mask = mask.resize(original_size, Image.BILINEAR)
    return mask

@app.route('/api/remove-background', methods=['POST'])
def remove_background_handler():
    if 'file' not in request.files:
        return {'error': 'No file part'}, 400
    
    file = request.files['file']
    if file.filename == '':
        return {'error': 'No selected file'}, 400
        
    if file:
        try:
            # Check/Download model
            download_model()
            
            # Load Inference Session
            # We treat the session as a singleton effectively as Vercel might reuse containers
            # Ideally load global, but for safety in serverless, loading in handler or lazy global
            session = ort.InferenceSession(MODEL_PATH)
            
            # Read Image
            input_image = Image.open(file.stream).convert('RGB')
            original_size = input_image.size
            
            # Inference
            inputs = preprocess(input_image)
            input_name = session.get_inputs()[0].name
            outputs = session.run(None, {input_name: inputs})
            
            # Process Mask
            mask = postprocess(outputs[0], original_size)
            
            # Composite
            empty = Image.new("RGBA", original_size, 0)
            result = Image.composite(input_image, empty, mask)
            
            # Save
            output_bytes = io.BytesIO()
            result.save(output_bytes, format='PNG')
            output_bytes.seek(0)
            
            return send_file(
                output_bytes, 
                mimetype='image/png',
                as_attachment=False,
                download_name='removed_bg.png'
            )
        except Exception as e:
            print(f"Error: {e}")
            return {'error': str(e)}, 500

if __name__ == '__main__':
    app.run(debug=True)
