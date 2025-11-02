from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from datetime import datetime
import os

# ---------------- Blueprint Setup ----------------
admin_bp = Blueprint('admin', __name__)

# ---------------- MongoDB Connection ----------------
client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017/'))
db = client['wellness_db']

admins_collection = db['admins']
users_collection = db['patients']
chats_collection = db['chats']
feedback_collection = db['feedback']
text_feedbacks = db['text_feedbacks']
keyword_responses = db['keyword_responses']

# ---------------- Helper ----------------
def serialize_id(data):
    """Convert ObjectId fields to strings."""
    if isinstance(data, list):
        for item in data:
            item['_id'] = str(item['_id'])
        return data
    if isinstance(data, dict) and '_id' in data:
        data['_id'] = str(data['_id'])
    return data

# ---------------- CREATE DEFAULT ADMIN (one-time) ----------------
@admin_bp.route('/admin/create_default', methods=['POST'])
def create_default_admin():
    """Create a default admin account (only run once)."""
    data = request.get_json()
    username = data.get('username', 'admin')
    password = data.get('password', 'admin123')

    if admins_collection.find_one({'username': username}):
        return jsonify({'message': 'Admin already exists'})

    hashed_pw = generate_password_hash(password)
    admins_collection.insert_one({
        'username': username,
        'password': hashed_pw,
        'created_at': datetime.utcnow()
    })
    return jsonify({'message': 'Default admin created successfully!'})


# ============================
# USER APPROVAL MANAGEMENT
# ============================

@admin_bp.route('/admin/users/pending', methods=['GET'])
def get_pending_users():
    """Return list of users awaiting admin approval."""
    users = list(users_collection.find({'is_approved': {'$ne': True}}))
    for u in users:
        u['_id'] = str(u['_id'])
    return jsonify(users), 200


@admin_bp.route('/admin/users/approve/<user_id>', methods=['PUT'])
def approve_user(user_id):
    """Approve a user."""
    users_collection.update_one({'_id': ObjectId(user_id)}, {'$set': {'is_approved': True, 'approved_at': datetime.utcnow()}})
    return jsonify({'message': 'User approved successfully'}), 200


@admin_bp.route('/admin/users/reject/<user_id>', methods=['DELETE'])
def reject_user(user_id):
    """Reject (delete) a user."""
    users_collection.delete_one({'_id': ObjectId(user_id)})
    return jsonify({'message': 'User rejected and removed'}), 200


# ============================
# PATIENT MANAGEMENT
# ============================

@admin_bp.route('/admin/patients', methods=['GET'])
def get_all_patients():
    """Fetch all registered patients along with approval status."""
    patients = list(users_collection.find())
    results = []

    for p in patients:
        p['_id'] = str(p['_id'])
        user = users_collection.find_one({'email': p.get('email')})
        is_approved = user.get('is_approved', False) if user else False

        results.append({
            **p,
            'is_approved': is_approved
        })

    return jsonify(results), 200


@admin_bp.route('/admin/patients/<patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    """Delete a patient by ID."""
    result = users_collection.delete_one({'_id': ObjectId(patient_id)})
    if result.deleted_count > 0:
        return jsonify({'message': 'Patient deleted successfully'}), 200
    return jsonify({'error': 'Patient not found'}), 404


@admin_bp.route('/admin/patients/<patient_id>', methods=['PUT'])
def update_patient(patient_id):
    """Modify patient details."""
    data = request.get_json()
    update_data = {}
    for field in ['name', 'email', 'age', 'gender', 'phone']:
        if field in data:
            update_data[field] = data[field]

    if not update_data:
        return jsonify({'error': 'No fields to update'}), 400

    result = users_collection.update_one({'_id': ObjectId(patient_id)}, {'$set': update_data})
    if result.matched_count > 0:
        return jsonify({'message': 'Patient updated successfully'}), 200
    return jsonify({'error': 'Patient not found'}), 404

# ---------------- FEEDBACK MONITORING ----------------
@admin_bp.route('/admin/feedback', methods=['GET'])
def view_feedback():
    """View all feedback entries (simplified version)."""
    try:
        feedbacks = list(feedback_collection.find().sort('created_at', -1))
        results = []

        for fb in feedbacks:
            results.append({
                'feedback_id': str(fb.get('_id')),
                'chat_id': fb.get('chat_id', 'N/A'),
                'message_index': fb.get('message_index', 0),
                'rating': fb.get('rating', 0),
                'created_at': fb.get('created_at').isoformat() if fb.get('created_at') else 'N/A'
            })

        return jsonify(results), 200

    except Exception as e:
        print(f"Error in view_feedback: {e}")
        return jsonify({'error': 'Internal server error'}), 500


#----------------------- Fetch all keywords and responses

def serialize_id(data):
    for d in data:
        d['_id'] = str(d['_id'])
    return data


@admin_bp.route('/admin/keywords', methods=['GET'])
def get_keywords():
    """Fetch all keywords and responses"""
    data = list(keyword_responses.find())
    return jsonify(serialize_id(data))


@admin_bp.route('/admin/keywords', methods=['POST'])
def add_keyword():
    """Add a new keyword or append response to existing"""
    data = request.get_json()
    keyword = data.get('keyword')
    response = data.get('response')

    if not keyword or not response:
        return jsonify({'error': 'Both keyword and response are required'}), 400

    existing = keyword_responses.find_one({'keyword': keyword})
    if existing:
        # Add response to existing keyword
        keyword_responses.update_one(
            {'_id': existing['_id']},
            {'$addToSet': {'responses': response}, '$set': {'updated_at': datetime.utcnow()}}
        )
        return jsonify({'message': 'Response added to existing keyword'})
    else:
        # Create new keyword
        keyword_responses.insert_one({
            'keyword': keyword,
            'responses': [response],
            'created_at': datetime.utcnow()
        })
        return jsonify({'message': 'Keyword added successfully'})


@admin_bp.route('/admin/keywords/<id>', methods=['PUT'])
def update_keyword(id):
    """Edit a keyword or its responses"""
    data = request.get_json()
    keyword = data.get('keyword')
    responses = data.get('responses')

    if not keyword or not isinstance(responses, list):
        return jsonify({'error': 'Keyword and responses list required'}), 400

    result = keyword_responses.update_one(
        {'_id': ObjectId(id)},
        {'$set': {'keyword': keyword, 'responses': responses, 'updated_at': datetime.utcnow()}}
    )
    if result.modified_count:
        return jsonify({'message': 'Keyword updated successfully'})
    return jsonify({'error': 'Keyword not found'}), 404


@admin_bp.route('/admin/keywords/<id>', methods=['DELETE'])
def delete_keyword(id):
    """Delete a keyword"""
    result = keyword_responses.delete_one({'_id': ObjectId(id)})
    if result.deleted_count:
        return jsonify({'message': 'Keyword deleted successfully'})
    return jsonify({'error': 'Keyword not found'}), 404


# ---------------- ANALYTICS (Optional) ----------------
# ---------------- ANALYTICS (Improved) ----------------
@admin_bp.route('/admin/analytics', methods=['GET'])
def analytics_dashboard():
    """Return detailed admin analytics including approval stats."""
    try:
        # Count user stats
        total_users = users_collection.count_documents({})
        approved_users = users_collection.count_documents({'approved': True})
        pending_users = users_collection.count_documents({'approved': False, 'rejected': {'$ne': True}})
        rejected_users = users_collection.count_documents({'rejected': True})

        # Count feedback & keywords
        feedback_count = feedback_collection.count_documents({})
        keyword_count = keyword_responses.count_documents({})

        # Calculate average feedback rating
        ratings = [fb.get('rating', 0) for fb in feedback_collection.find()]
        avg_feedback = round(sum(ratings) / len(ratings), 2) if ratings else 0.0

        # Final stats dictionary
        stats = {
            'total_users': total_users,
            'approved_users': approved_users,
            'pending_users': pending_users,
            'rejected_users': rejected_users,
            'feedback_count': feedback_count,
            'keyword_count': keyword_count,
            'average_feedback': avg_feedback
        }

        return jsonify(stats), 200

    except Exception as e:
        print(f"Error in analytics_dashboard: {e}")
        return jsonify({'error': 'Internal server error'}), 500


# ---------------- TEXT FEEDBACK MONITORING ----------------
@admin_bp.route('/admin/text_feedbacks', methods=['GET'])
def view_text_feedbacks():
    """View all text feedbacks with user details (if available)."""
    try:
        feedbacks = list(text_feedbacks.find().sort('created_at', -1))
        results = []

        for fb in feedbacks:
            # Fetch user details from patients collection
            user = users_collection.find_one({'_id': ObjectId(fb['_id'])}) if fb.get('_id') else None
            # name = user.get('name', 'Unknown') if user else 'Unknown'

            results.append({
                '_id': str(fb.get('_id')),
                'user_id': str(fb.get('user_id')) if fb.get('user_id') else 'N/A',
                'user_name': fb.get('name', 0),
                'rating': fb.get('rating', 0),
                'feedback': fb.get('feedback', ''),
                'created_at': fb.get('created_at').isoformat() if fb.get('created_at') else 'N/A'
            })

        return jsonify(results), 200

    except Exception as e:
        print(f"Error fetching text feedbacks: {e}")
        return jsonify({'error': 'Internal server error'}), 500
