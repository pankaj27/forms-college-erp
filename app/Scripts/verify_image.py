import cv2
import sys
import json
import os

def verify_image(file_path, doc_type):
    if not os.path.exists(file_path):
        return {"success": False, "message": "File not found"}

    try:
        img = cv2.imread(file_path)
        if img is None:
            return {"success": False, "message": "Invalid image file"}
            
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Load Face Cascade
        face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        face_cascade = cv2.CascadeClassifier(face_cascade_path)
        
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if doc_type == 'photo':
            if len(faces) > 0:
                return {"success": True, "message": "Face detected"}
            else:
                return {"success": False, "message": "No face detected in the photo. Please upload a clear photo of the student."}
                
        elif doc_type == 'signature':
            if len(faces) > 0:
                 return {"success": False, "message": "Face detected in signature. Please upload a signature image."}
            
            # Basic content check for signature
            # Threshold to separate ink from paper
            _, binary = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)
            non_zero_pixels = cv2.countNonZero(binary)
            total_pixels = binary.shape[0] * binary.shape[1]
            ratio = non_zero_pixels / total_pixels
            
            # Signature usually covers 1% to 30% of the image (very rough estimate)
            # If it's too empty (< 0.5%) or too full (> 50%), it might be invalid
            if ratio < 0.001: # lowered threshold
                return {"success": False, "message": "Image appears blank. Please upload a visible signature."}
            if ratio > 0.8: # increased threshold
                 return {"success": False, "message": "Image is too dark or cluttered. Please upload a clear signature on white background."}
                 
            return {"success": True, "message": "Valid signature"}
            
        else:
            # For other documents, just basic check (it opened fine)
            return {"success": True, "message": "Valid file"}

    except Exception as e:
        return {"success": False, "message": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"success": False, "message": "Invalid arguments"}))
        sys.exit(1)
        
    file_path = sys.argv[1]
    doc_type = sys.argv[2] # 'photo', 'signature', or other
    
    result = verify_image(file_path, doc_type)
    print(json.dumps(result))
