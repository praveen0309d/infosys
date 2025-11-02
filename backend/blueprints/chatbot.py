from flask import Blueprint, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import os
import re
import difflib
from bson import ObjectId
from googletrans import Translator
import spacy

# ---------------- Flask Blueprint ----------------
chatbot_bp = Blueprint('chatbot', __name__)
CORS(chatbot_bp)

# ---------------- MongoDB Connection ----------------
client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017/'))
db = client['wellness_db']
chats_collection = db['chats']
users_collection = db['users']
feedback_collection = db['feedback']
keyword_responses=db['keyword_responses']
# ---------------- NLP Initialization ----------------
nlp = spacy.load("en_core_web_sm")
translator = Translator()

# ---------------- Keyword-based Responses ----------------
def get_keyword_responses_from_db():
    """Fetch all keyword-response pairs from MongoDB"""
    responses = {}
    try:
        cursor = db['keyword_responses'].find()
        for doc in cursor:
            keyword = doc.get('keyword', '').lower()
            response = doc.get('response') or doc.get('responses', [])

            # Always keep list format
            if isinstance(response, list):
                responses[keyword] = response
            elif response:
                responses[keyword] = [response]  # wrap single string into list

    except Exception as e:
        print(f"Error fetching keyword responses: {e}")
    return responses

# Enhanced FAQ database

# ---------------- Auto Disclaimer ----------------
AUTO_DISCLAIMER = (
    "\n\n⚕️ *Disclaimer:* I provide general health information. "
    "Always consult a qualified medical professional for personal diagnosis or treatment."
)

# ---------------- Health Entity Extraction ----------------
def extract_health_entities(text):
    """Identify health-related entities from user messages."""
    doc = nlp(text)
    entities = []
    health_keywords = ["pain", "fever", "infection", "cough", "disease", "tablet", "medicine", "ache", "pressure"]

    for ent in doc.ents:
        if ent.label_ in ["SYMPTOM", "DISEASE", "ORG", "GPE", "PERSON"] or any(k in ent.text.lower() for k in health_keywords):
            entities.append(ent.text)
    
    symptom_matches = re.findall(r'\b(headache|fever|cough|cold|stress|pain|fatigue|asthma|diabetes)\b', text.lower())
    entities.extend(symptom_matches)

    return list(set(entities))

# ---------------- Multilingual Translation ----------------
def translate_message(text, target_lang):
    try:
        translated = translator.translate(text, dest=target_lang)
        return translated.text
    except Exception as e:
        print(f"Translation error: {e}")
        return text

def detect_language(text):
    try:
        detection = translator.detect(text)
        return detection.lang
    except:
        return "en"

# ---------------- Keyword Response ----------------
def get_keyword_response(message):
    message_lower = message.lower()
    keyword_responses = get_keyword_responses_from_db()  # Fetch from MongoDB

    for keyword, responses in keyword_responses.items():
        if keyword in message_lower:
            # If the keyword matches and responses is a list, format it properly
            if isinstance(responses, list):
                formatted_response = "Here are some suggestions:\n" + "\n".join(
                    [f"- {r}" for r in responses]
                )

                return formatted_response
            else:
                return responses  # Single string fallback

    # Fuzzy match
    best_match = None
    highest_ratio = 0
    for keyword in keyword_responses.keys():
        ratio = difflib.SequenceMatcher(None, message_lower, keyword).ratio()
        if ratio > highest_ratio and ratio > 0.6:
            highest_ratio = ratio
            best_match = keyword

    if best_match:
        responses = keyword_responses[best_match]
        if isinstance(responses, list):
            formatted_response = "Here are some suggestions:\n" + "\n".join(
                [f"- {r}" for r in responses]
            )
            return formatted_response
        else:
            return responses

    return (
        "I'm here to help with your health and wellness questions. "
        "Could you please provide more details?"
    )

# ---------------- MongoDB Chat Handlers ----------------
def save_chat_to_mongodb(user_id, chat_data):
    chat_document = {
        'user_id': user_id,
        'title': chat_data.get('title', 'New Chat'),
        'messages': chat_data['messages'],
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow(),
        'is_active': True
    }
    result = chats_collection.insert_one(chat_document)
    return str(result.inserted_id)

def update_chat_in_mongodb(chat_id, messages):
    chats_collection.update_one(
        {'_id': ObjectId(chat_id)},
        {'$set': {'messages': messages, 'updated_at': datetime.utcnow()}}
    )
    return True

def get_chat_messages(chat_id):
    chat = chats_collection.find_one({'_id': ObjectId(chat_id)})
    return chat['messages'] if chat else []

def get_user_chats(user_id):
    chat_cursor = chats_collection.find({'user_id': user_id}).sort('updated_at', -1)
    chats = []
    for chat in chat_cursor:
        last_msg = chat['messages'][-1]['text'] if chat.get('messages') else ''
        chats.append({
            'chat_id': str(chat['_id']),
            'title': chat.get('title', 'New Chat'),
            'last_message': last_msg,
            'updated_at': chat.get('updated_at', chat.get('created_at')).isoformat(),
            'is_active': chat.get('is_active', True)
        })
    return chats

# ---------------- Chat API Routes ----------------
@chatbot_bp.route('/chat/send', methods=['POST'])
def send_message():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        message = data.get('message', '').strip()
        chat_id = data.get('chat_id')

        if not user_id or not message:
            return jsonify({'error': 'User ID and message required'}), 400

        # Detect language and translate if needed
        detected_lang = detect_language(message)
        message_en = translate_message(message, 'en') if detected_lang != 'en' else message

        # Extract entities
        entities = extract_health_entities(message_en)

        # Get keyword-based response
        bot_response_en = get_keyword_response(message_en)

        # Add entities (if found)
        if entities:
            bot_response_en += f"\n\n🔍 *I noticed you mentioned:* {', '.join(entities)}."

        # Add disclaimer with emoji and newline
        bot_response_en += (
            "\n\n ⚠️*Disclaimer:* I provide general health information. "
            "Always consult a qualified medical professional for personal diagnosis or treatment."
        )

        # Translate back to original language (if needed)
        bot_response = (
            translate_message(bot_response_en, detected_lang)
            if detected_lang != 'en'
            else bot_response_en
        )

        # Save messages
        user_message = {
            'text': message,
            'sender': 'user',
            'timestamp': datetime.utcnow().isoformat()
        }
        bot_message = {
            'text': bot_response,
            'sender': 'bot',
            'timestamp': datetime.utcnow().isoformat()
        }

        if chat_id:
            messages = get_chat_messages(chat_id) + [user_message, bot_message]
            update_chat_in_mongodb(chat_id, messages)
        else:
            chat_data = {'title': message[:40], 'messages': [user_message, bot_message]}
            chat_id = save_chat_to_mongodb(user_id, chat_data)

        return jsonify({
            'response': bot_response,
            'chat_id': chat_id,
            'language': detected_lang,
            'entities': entities
        })

    except Exception as e:
        print(f"Error in /chat/send: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@chatbot_bp.route('/chat/history', methods=['GET'])
def get_chat_history():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        chats = get_user_chats(user_id)
        return jsonify({'chats': chats})
    except Exception as e:
        print(f"Error in get_chat_history: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@chatbot_bp.route('/chat/<chat_id>', methods=['GET'])
def get_chat(chat_id):
    try:
        messages = get_chat_messages(chat_id)
        if messages:
            return jsonify({'messages': messages})
        return jsonify({'error': 'Chat not found'}), 404
    except Exception as e:
        print(f"Error in get_chat: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@chatbot_bp.route('/chat/<chat_id>', methods=['DELETE'])
def delete_chat(chat_id):
    try:
        result = chats_collection.delete_one({'_id': ObjectId(chat_id)})
        if result.deleted_count > 0:
            return jsonify({'message': 'Chat permanently deleted'})
        return jsonify({'error': 'Chat not found'}), 404
    except Exception as e:
        print(f"Error in delete_chat: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@chatbot_bp.route('/chat/search', methods=['GET'])
def search_chats():
    try:
        user_id = request.args.get('user_id')
        query = request.args.get('q', '').strip()
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        if not query:
            return get_recent_chats(user_id)

        # MongoDB regex search
        search_query = {
            'user_id': user_id,
            'is_active': True,
            '$or': [
                {'title': {'$regex': query, '$options': 'i'}},
                {'messages.text': {'$regex': query, '$options': 'i'}}
            ]
        }
        chats = list(chats_collection.find(search_query).sort('updated_at', -1))

        results = []
        for chat in chats:
            matching_messages = []
            for msg in chat.get('messages', []):
                if query.lower() in msg.get('text', '').lower():
                    match_index = msg['text'].lower().find(query.lower())
                    start = max(0, match_index - 20)
                    end = min(len(msg['text']), match_index + len(query) + 20)
                    snippet = ('...' if start > 0 else '') + msg['text'][start:end] + ('...' if end < len(msg['text']) else '')
                    matching_messages.append({
                        'text': msg['text'],
                        'snippet': snippet,
                        'sender': msg.get('sender', 'unknown'),
                        'timestamp': msg.get('timestamp'),
                        'match_position': match_index
                    })
            preview_text = matching_messages[0]['snippet'] if matching_messages else (chat.get('messages', [{}])[-1].get('text', 'New chat'))
            results.append({
                'chat_id': str(chat['_id']),
                'title': chat.get('title', 'New Chat'),
                'last_message': preview_text,
                'preview': preview_text,
                'matching_messages': matching_messages,
                'updated_at': chat.get('updated_at', chat.get('created_at', datetime.utcnow())).isoformat(),
                'message_count': len(chat.get('messages', [])),
                'match_count': len(matching_messages)
            })

        return jsonify({'results': results, 'total_found': len(results), 'query': query})
    except Exception as e:
        print(f"Error in search_chats: {e}")
        return jsonify({'error': f'Search error: {str(e)}'}), 500

def get_recent_chats(user_id):
    chats = list(chats_collection.find({'user_id': user_id, 'is_active': True}).sort('updated_at', -1).limit(50))
    results = []
    for chat in chats:
        last_msg = chat.get('messages', [{}])[-1].get('text', 'New chat')
        results.append({
            'chat_id': str(chat['_id']),
            'title': chat.get('title', 'New Chat'),
            'last_message': last_msg,
            'preview': last_msg,
            'updated_at': chat.get('updated_at', chat.get('created_at', datetime.utcnow())).isoformat(),
            'message_count': len(chat.get('messages', [])),
            'is_recent': True
        })
    return jsonify({'results': results})

@chatbot_bp.route('/analytics/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'database': 'connected' if client else 'disconnected'
    })

def save_feedback(chat_id, message_index, rating, comments=""):
    """Save user feedback for specific message"""
    try:
        feedback = {
            'chat_id': chat_id,
            'message_index': message_index,
            'rating': rating,  # 1-5 or thumbs up/down
            'comments': comments,
            'created_at': datetime.utcnow()
        }
        feedback_collection.insert_one(feedback)
        return True
    except Exception as e:
        print(f"Error saving feedback: {e}")
        return False

@chatbot_bp.route('/chat/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.get_json()
        chat_id = data.get('chat_id')
        message_index = data.get('message_index')
        rating = data.get('rating')
        comments = data.get('comments', '')
        
        if save_feedback(chat_id, message_index, rating, comments):
            return jsonify({'message': 'Feedback saved successfully'})
        return jsonify({'error': 'Failed to save feedback'}), 400
    except Exception as e:
        print(f"Error in feedback: {e}")
        return jsonify({'error': 'Internal server error'}), 500