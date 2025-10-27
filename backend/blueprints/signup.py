from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import re
from datetime import datetime, timedelta
from pymongo import MongoClient
import os
import jwt
import traceback

# Initialize Blueprint (only once)
auth_bp = Blueprint("auth_bp", __name__)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["wellness_db"]
patients_collection = db["patients"]

# JWT secret key
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-jwt-secret-key'

# ------------------ SIGNUP ROUTE ------------------
@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json(force=True)
        
        # Required fields
        required_fields = ["name", "email", "phone", "age", "gender", "password"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"message": f"{field} is required"}), 400

        # Safe stripping
        email = (data.get("email") or "").strip().lower()
        phone = (data.get("phone") or "").strip()
        password = data.get("password")
        emergency_contact = (data.get("emergencyContact") or "").strip()

        # Validate email
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({"message": "Invalid email format"}), 400

        # Validate phone
        if not re.match(r'^\d{10}$', phone):
            return jsonify({"message": "Phone number must be 10 digits"}), 400

        # Validate age
        try:
            age = int(data.get("age"))
            if age < 1 or age > 120:
                return jsonify({"message": "Age must be between 1 and 120"}), 400
        except ValueError:
            return jsonify({"message": "Age must be a valid number"}), 400

        # Validate password length
        if len(password) < 6:
            return jsonify({"message": "Password must be at least 6 characters"}), 400

        # Check if user exists
        if patients_collection.find_one({"email": email}):
            return jsonify({"message": "Email already registered!"}), 400
        if patients_collection.find_one({"phone": phone}):
            return jsonify({"message": "Phone number already registered!"}), 400

        # Validate emergency contact
        if emergency_contact and not re.match(r'^\d{10}$', emergency_contact):
            return jsonify({"message": "Emergency contact must be 10 digits"}), 400

        # Create patient document
        patient = {
            "name": (data.get("name") or "").strip(),
            "email": email,
            "phone": phone,
            "age": age,
            "gender": data.get("gender"),
            "password": generate_password_hash(password),
            "emergencyContact": emergency_contact,
            "bloodGroup": data.get("bloodGroup", ""),
            "address": (data.get("address") or "").strip(),
            "medicalHistory": (data.get("medicalHistory") or "").strip(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }

        result = patients_collection.insert_one(patient)

        return jsonify({
            "message": "Account created successfully!",
            "patientId": str(result.inserted_id)
        }), 201

    except Exception as e:
        traceback.print_exc()
        return jsonify({"message": "Internal server error"}), 500


# ------------------ LOGIN ROUTE ------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(force=True)

        # Validate required fields
        if not data.get("email") or not data.get("password"):
            return jsonify({"message": "Email and password are required"}), 400

        email = (data.get("email") or "").strip().lower()
        password = data.get("password")

        # Find patient by email
        patient = patients_collection.find_one({"email": email})
        if not patient:
            return jsonify({"message": "Invalid email or password"}), 401

        # Check password
        if not check_password_hash(patient.get("password", ""), password):
            return jsonify({"message": "Invalid email or password"}), 401

        # Generate JWT token
        token = jwt.encode({
            'patient_id': str(patient['_id']),
            'email': patient['email'],
            'exp': datetime.utcnow() + timedelta(days=7)
        }, JWT_SECRET_KEY, algorithm='HS256')

        # Prepare patient data (exclude password)
        patient_data = {
            "id": str(patient["_id"]),
            "name": patient.get("name", ""),
            "email": patient.get("email", ""),
            "phone": patient.get("phone", ""),
            "age": patient.get("age", ""),
            "gender": patient.get("gender", ""),
            "bloodGroup": patient.get("bloodGroup", ""),
            "emergencyContact": patient.get("emergencyContact", ""),
            "address": patient.get("address", ""),
            "medicalHistory": patient.get("medicalHistory", "")
        }

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": patient_data
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"message": "Internal server error"}), 500
