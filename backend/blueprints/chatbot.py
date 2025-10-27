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

# ---------------- NLP Initialization ----------------
nlp = spacy.load("en_core_web_sm")
translator = Translator()

# ---------------- Keyword-based Responses ----------------
keyword_responses = {
    'hello': "Hello! I'm your Wellness Assistant. How can I help you with your health today?",
    'hi': "Hi there! I'm here to assist with your health and wellness questions. What can I help you with?",
    'headache': "Headaches can result from stress or dehydration. Rest, hydrate, and see a doctor if persistent.",
    'fever': "For fever below 102°F, rest and hydrate. Seek care if it lasts over 3 days or exceeds 103°F.",
    'cough': "Drink fluids and rest. If it lasts more than 3 weeks or causes difficulty breathing, see a doctor.",
    'stress': "Try deep breathing and mindfulness. If stress affects your sleep or work, seek professional help.",
    'diet': "Eat more fruits, vegetables, lean proteins, and whole grains. Avoid excess sugar and salt.",
    'exercise': "Do at least 150 minutes of activity weekly. Combine cardio and strength training for best results.",
    # Body Systems
    'chest pain': 'Chest pain requires immediate evaluation. If accompanied by shortness of breath, sweating, or radiating pain, call 911 immediately.',
    'abdominal pain': 'Rest and avoid solid foods initially. Seek emergency care for severe pain, fever, vomiting, or if pain moves to lower right abdomen.',
    'back pain': 'Practice good posture, apply heat/ice, and gentle stretching. See a doctor if pain radiates down legs, causes numbness, or follows injury.',
    'joint pain': 'Rest the affected joint, apply ice, and consider anti-inflammatory medication. Consult a doctor for persistent swelling or redness.',
    
    # Chronic Conditions
    'diabetes': 'Monitor blood sugar regularly, follow a balanced diet, exercise, and take medications as prescribed. Regular check-ups are essential for management.',
    'blood pressure': 'Normal BP is below 120/80 mmHg. Monitor regularly, reduce sodium intake, exercise, and take prescribed medications. Consult if consistently above 130/80.',
    'cholesterol': 'Focus on heart-healthy fats, soluble fiber, and regular exercise. Statins or other medications may be needed as prescribed by your doctor.',
    'asthma': 'Use inhalers as prescribed, avoid triggers, and have an action plan. Seek emergency care for severe breathing difficulty or if rescue inhaler isn\'t helping.',
    
    # Mental Health
    'anxiety': 'Practice deep breathing, mindfulness, and regular exercise. Limit caffeine and consider therapy. Seek help if anxiety interferes with daily life.',
    'depression': 'Reach out to loved ones, maintain routine, and consider therapy. For urgent help, contact a crisis hotline. Medication and therapy can be very effective.',
    'stress': 'Try meditation, exercise, time management, and setting boundaries. Consider talking to a mental health professional for ongoing support.',
    'mental health': 'Mental health is crucial. Therapy, support groups, and sometimes medication can help. You\'re not alone - professional support is available.',
    
    # Lifestyle & Prevention
    'diet': 'Focus on whole foods: fruits, vegetables, lean proteins, and whole grains. Limit processed foods, sugar, and saturated fats. Stay hydrated!',
    'exercise': 'Aim for 150 minutes of moderate exercise weekly. Include strength training twice weekly. Always warm up and consult your doctor before new routines.',
    'sleep': 'Adults need 7-9 hours nightly. Maintain consistent sleep/wake times, limit screens before bed, and create a dark, quiet sleep environment.',
    'weight': 'Focus on sustainable habits: balanced diet, regular exercise, and adequate sleep. Consult a nutritionist for personalized guidance.',
    
    # Medications & Treatments
    'medicine': 'Take medications exactly as prescribed. Never share prescriptions. Report side effects to your doctor immediately. Keep an updated medication list.',
    'vaccine': 'Vaccines prevent serious diseases. Stay current with recommended immunizations based on age, health conditions, and travel plans.',
    'antibiotic': 'Complete the full course as prescribed, even if you feel better. Never save antibiotics for later use or share them with others.',
    
    # Appointments & Services
    'appointment': 'Book appointments online through our portal or call (555) 123-HEAL. Have your insurance information ready when scheduling.',
    'prescription': 'For refills, contact your pharmacy or use our patient portal. Allow 48 hours for processing. Never skip doses waiting for refills.',
    'insurance': 'We accept most major insurance plans. Verify coverage with your provider and bring your insurance card to all appointments.',
    
    # Emergency & Urgent Care
    'emergency': 'For life-threatening emergencies: chest pain, difficulty breathing, severe bleeding, or stroke symptoms - CALL 911 IMMEDIATELY.',
    'urgent': 'For urgent but non-life-threatening issues, visit our urgent care center open 8 AM-8 PM daily. No appointment needed.',
    
    # Special Populations
    'pregnancy': 'Schedule prenatal care early. Take prenatal vitamins, avoid alcohol/smoking, and attend all appointments. Call for any bleeding or severe pain.',
    'pediatric': 'Children\'s health needs specialized care. Keep up with well-child visits and vaccinations. Trust your instincts as a parent.',
    'senior': 'Regular health screenings become increasingly important. Discuss fall prevention, medication management, and preventive care with your doctor.',
    
    # Wellness & Prevention
    'prevention': 'Regular check-ups, vaccinations, healthy lifestyle, and screenings are key to preventive care. Know your family health history.',
    'screening': 'Stay current with age-appropriate screenings: blood pressure, cholesterol, diabetes, and cancer screenings as recommended.',
    'hydration': 'Aim for 8-10 glasses of water daily. More may be needed with exercise, heat, or illness. Listen to your thirst cues.',
    
    # Seasonal Health
    'allergy': 'Avoid triggers, use antihistamines as directed, and keep windows closed during high pollen seasons. See an allergist for persistent symptoms.',
    'flu': 'Get annual flu vaccine, practice good hand hygiene, and stay home when sick. Antiviral medications can help if started early.',
    'cold': 'Rest, hydrate, and use OTC symptom relief. Most colds resolve in 7-10 days. See a doctor if symptoms worsen or persist.',
    
    # Additional Common Concerns
    'skin': 'Protect skin from sun with SPF 30+, moisturize regularly, and check moles for changes. See a dermatologist for concerning changes.',
    'digestive': 'Eat fiber-rich foods, stay hydrated, and exercise regularly. Consult for persistent digestive issues or blood in stool.',
    'vision': 'Get regular eye exams, protect eyes from UV light, and take screen breaks. Sudden vision changes require immediate attention.',
    
    # General Health Advice
    'healthy': 'A balanced lifestyle includes: nutritious diet, regular exercise, adequate sleep, stress management, and preventive healthcare.',
    'checkup': 'Annual physicals help catch issues early. Discuss any concerns, family history, and lifestyle factors with your provider.',
    'advice': 'I provide general health information. Always consult healthcare professionals for personal medical advice and treatment.'
}

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
    for keyword, response in keyword_responses.items():
        if keyword in message_lower:
            return response
    
    # Fuzzy match
    best_match = None
    highest_ratio = 0
    for keyword in keyword_responses.keys():
        ratio = difflib.SequenceMatcher(None, message_lower, keyword).ratio()
        if ratio > highest_ratio and ratio > 0.6:
            highest_ratio = ratio
            best_match = keyword_responses[keyword]
    
    if best_match:
        return best_match
    
    return "I'm here to help with your health and wellness questions. Could you please provide more details?"

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

        detected_lang = detect_language(message)
        message_en = translate_message(message, 'en') if detected_lang != 'en' else message

        entities = extract_health_entities(message_en)
        bot_response_en = get_keyword_response(message_en)
        if entities:
            bot_response_en += f"\n\n🔍 I noticed you mentioned: {', '.join(entities)}."
        bot_response_en += AUTO_DISCLAIMER
        bot_response = translate_message(bot_response_en, detected_lang) if detected_lang != 'en' else bot_response_en

        user_message = {'text': message, 'sender': 'user', 'timestamp': datetime.utcnow().isoformat()}
        bot_message = {'text': bot_response, 'sender': 'bot', 'timestamp': datetime.utcnow().isoformat()}

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

@chatbot_bp.route('/chat/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'database': 'connected' if client else 'disconnected'
    })

