from werkzeug.security import generate_password_hash
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["wellness_db"]  # use your DB name
admins_collection = db["admins"]

admin_data = {
    "name": "Admin User",
    "email": "admin@wellnesscare.com",
    "password": generate_password_hash("123"),  # your chosen password
    "role": "admin"
}

admins_collection.insert_one(admin_data)
print("✅ Admin account created successfully!")
