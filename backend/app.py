from flask import Flask
from flask_cors import CORS
from blueprints.signup import auth_bp
from blueprints.chatbot import chatbot_bp
from blueprints.admin_routes import admin_bp
from blueprints.feedback_bp import feedback_bp




app = Flask(__name__)
app.config['SECRET_KEY'] = "your_secret_key_here"

# Enable CORS for React frontend
CORS(app)


@app.route('/')
def home():
    return "Backend running successfully!"
# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(chatbot_bp, url_prefix="/api")
app.register_blueprint(admin_bp, url_prefix="/api")
app.register_blueprint(feedback_bp, url_prefix="/api")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
