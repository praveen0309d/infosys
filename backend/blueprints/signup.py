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
admins_collection = db["admins"]


# JWT secret key
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-jwt-secret-key'

# ------------------ SIGNUP ROUTE ------------------
# ------------------ SIGNUP ROUTE (Requires Admin Approval) ------------------
@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json(force=True)

        # ✅ Required fields
        required_fields = ["name", "email", "phone", "age", "gender", "password"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"message": f"{field} is required"}), 400

        # ✅ Safe stripping and validation
        email = (data.get("email") or "").strip().lower()
        phone = (data.get("phone") or "").strip()
        password = data.get("password")
        emergency_contact = (data.get("emergencyContact") or "").strip()

        # Email validation
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({"message": "Invalid email format"}), 400

        # Phone validation
        if not re.match(r'^\d{10}$', phone):
            return jsonify({"message": "Phone number must be 10 digits"}), 400

        # Age validation
        try:
            age = int(data.get("age"))
            if age < 1 or age > 120:
                return jsonify({"message": "Age must be between 1 and 120"}), 400
        except ValueError:
            return jsonify({"message": "Age must be a valid number"}), 400

        # Password validation
        if len(password) < 6:
            return jsonify({"message": "Password must be at least 6 characters"}), 400

        # Check duplicates
        if patients_collection.find_one({"email": email}):
            return jsonify({"message": "Email already registered!"}), 400
        if patients_collection.find_one({"phone": phone}):
            return jsonify({"message": "Phone number already registered!"}), 400

        # Emergency contact validation
        if emergency_contact and not re.match(r'^\d{10}$', emergency_contact):
            return jsonify({"message": "Emergency contact must be 10 digits"}), 400

        # ✅ Create patient with "pending approval"
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
            "updatedAt": datetime.utcnow(),
            "is_approved": False,  # ❗ New field: requires admin approval
            "approvedBy": None,  # Admin ID or name once approved
            "approvedAt": None
        }

        # Insert into MongoDB
        result = patients_collection.insert_one(patient)

        # Return response
        return jsonify({
            "message": "Signup successful! Your account is pending admin approval.",
            "patientId": str(result.inserted_id),
            "status": "pending"
        }), 201

    except Exception as e:
        traceback.print_exc()
        return jsonify({"message": "Internal server error"}), 500

# ------------------ LOGIN ROUTE ------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(force=True)

        # Validate input
        if not data.get("email") or not data.get("password"):
            return jsonify({"message": "Email and password are required"}), 400

        email = (data.get("email") or "").strip().lower()
        password = data.get("password")

        # First, check if admin
        admin = admins_collection.find_one({"email": email})
        if admin:
            if not check_password_hash(admin.get("password", ""), password):
                return jsonify({"message": "Invalid email or password"}), 401

            # Generate JWT for admin
            token = jwt.encode({
                'admin_id': str(admin['_id']),
                'email': admin['email'],
                'role': 'admin',
                'exp': datetime.utcnow() + timedelta(days=7)
            }, JWT_SECRET_KEY, algorithm='HS256')

            return jsonify({
                "message": "Admin login successful",
                "token": token,
                "user": {
                    "id": str(admin["_id"]),
                    "name": admin.get("name", ""),
                    "email": admin.get("email", ""),
                    "role": "admin"
                }
            }), 200

        # Otherwise, check if patient
        patient = patients_collection.find_one({"email": email})
        if not patient:
            return jsonify({"message": "Invalid email or password"}), 401

        if not check_password_hash(patient.get("password", ""), password):
            return jsonify({"message": "Invalid email or password"}), 401

        # 🚫 Check if account is approved
        if not patient.get("is_approved", False):
            return jsonify({
                "message": "Your account is pending admin approval. Please wait for confirmation."
            }), 403

        # ✅ If approved, generate JWT
        token = jwt.encode({
            'patient_id': str(patient['_id']),
            'email': patient['email'],
            'role': 'patient',
            'exp': datetime.utcnow() + timedelta(days=7)
        }, JWT_SECRET_KEY, algorithm='HS256')

        # Patient data
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
            "medicalHistory": patient.get("medicalHistory", ""),
            "role": "patient"
        }

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": patient_data
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"message": "Internal server error"}), 500
