import os
from flask import Flask
from .services.llmServices import init_rag
from config import Config

def create_app():
    app = Flask(__name__)
    UPLOAD_FOLDER = 'uploads'
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    app.config.from_object(Config)
    
    init_rag(app)
    
    from .routes import main
    app.register_blueprint(main)

    return app