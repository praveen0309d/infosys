from flask import Flask
from flask_cors import CORS
from blueprints.signup import auth_bp
from blueprints.chatbot import chatbot_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = "your_secret_key_here"

# Enable CORS for React frontend
CORS(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(chatbot_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
