import os
import json
import uuid
from flask import Flask, render_template, request, Response, session, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your-secret-key')
CORS(app)

# Configure Gemini with better error handling
try:
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        logger.warning("GEMINI_API_KEY environment variable is not set! App will start but AI features won't work.")
        # Don't raise an error, let the app start
        genai_configured = False
    else:
        genai.configure(api_key=api_key)
        logger.info("Gemini AI configured successfully")
        genai_configured = True
except Exception as e:
    logger.error(f"Failed to configure Gemini AI: {e}")
    genai_configured = False

# Store chat sessions (in production, use a database)
chat_sessions = {}

@app.route('/test')
def test():
    """Simple test endpoint"""
    return "Hello from AI Chatbot! The app is running correctly."

@app.route('/health')
def health_check():
    """Health check endpoint for Railway"""
    return jsonify({
        'status': 'healthy',
        'timestamp': time.time(),
        'gemini_configured': genai_configured,
        'port': os.environ.get('PORT', 'not set'),
        'environment': os.environ.get('FLASK_ENV', 'not set')
    })

@app.route('/')
def index():
    try:
        if 'session_id' not in session:
            session['session_id'] = str(uuid.uuid4())
        logger.info(f"Serving index page for session: {session.get('session_id')}")
        return render_template('index.html')
    except Exception as e:
        logger.error(f"Error serving index page: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        if not genai_configured:
            return jsonify({'error': 'AI service not configured. Please check environment variables.'}), 503
            
        data = request.get_json()
        message = data.get('message', '').strip()
        session_id = session.get('session_id')
        
        if not message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Initialize chat session if not exists
        if session_id not in chat_sessions:
            model = genai.GenerativeModel('gemini-1.5-flash')
            chat_sessions[session_id] = model.start_chat(history=[])
        
        chat_session = chat_sessions[session_id]
        
        def generate():
            try:
                # Send message and get streaming response
                response = chat_session.send_message(message, stream=True)
                
                yield f"data: {json.dumps({'type': 'start'})}\n\n"
                
                full_response = ""
                for chunk in response:
                    if chunk.text:
                        full_response += chunk.text
                        yield f"data: {json.dumps({'type': 'content', 'text': chunk.text})}\n\n"
                
                yield f"data: {json.dumps({'type': 'end', 'full_text': full_response})}\n\n"
                
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        
        return Response(generate(), mimetype='text/event-stream')
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat-history')
def get_chat_history():
    try:
        session_id = session.get('session_id')
        if session_id in chat_sessions:
            chat = chat_sessions[session_id]
            history = []
            for message in chat.history:
                history.append({
                    'role': message.role,
                    'content': message.parts[0].text if message.parts else ''
                })
            return jsonify({'history': history})
        return jsonify({'history': []})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/clear-chat', methods=['POST'])
def clear_chat():
    try:
        session_id = session.get('session_id')
        if session_id in chat_sessions:
            del chat_sessions[session_id]
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export-chat')
def export_chat():
    try:
        session_id = session.get('session_id')
        if session_id in chat_sessions:
            chat = chat_sessions[session_id]
            history = []
            for message in chat.history:
                role = "You" if message.role == "user" else "AI Assistant"
                content = message.parts[0].text if message.parts else ''
                history.append(f"{role}: {content}\n")
            
            export_text = "\n".join(history)
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            
            response = Response(export_text, mimetype='text/plain')
            response.headers['Content-Disposition'] = f'attachment; filename=chat_export_{timestamp}.txt'
            return response
        
        return jsonify({'error': 'No chat history found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    try:
        port = int(os.environ.get('PORT', 5000))
        debug_mode = os.environ.get('FLASK_ENV') == 'development'
        
        logger.info(f"Starting Flask app on port {port}")
        logger.info(f"Debug mode: {debug_mode}")
        logger.info(f"Gemini API key configured: {bool(os.getenv('GEMINI_API_KEY'))}")
        
        app.run(debug=debug_mode, host='0.0.0.0', port=port)
    except Exception as e:
        logger.error(f"Failed to start Flask app: {e}")
        raise
