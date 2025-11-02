from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
import os

feedback_bp = Blueprint("feedback_bp", __name__)

# MongoDB connection
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
db = client["wellness_db"]  # ✅ Use your DB name
feedback_collection = db["text_feedbacks"]
patients_collection = db["patients"]

@feedback_bp.route("/feedback", methods=["POST"])
def submit_feedback():
    try:
        data = request.get_json(force=True)
        user_id = data.get("user_id")
        rating = data.get("rating")
        feedback = data.get("feedback")

        if not user_id or not feedback:
            return jsonify({"error": "User ID and feedback required"}), 400

        # Check user existence
        user = patients_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found. Please log in again."}), 404

        feedback_doc = {
            "user_id": ObjectId(user_id),
            "name": user.get("name", "Unknown"),
            "rating": int(rating),
            "feedback": feedback,
            "created_at": datetime.utcnow()
        }

        feedback_collection.insert_one(feedback_doc)
        return jsonify({"message": "Feedback submitted successfully!"}), 200

    except Exception as e:
        print(f"Error saving feedback: {e}")
        return jsonify({"error": "Internal server error"}), 500
