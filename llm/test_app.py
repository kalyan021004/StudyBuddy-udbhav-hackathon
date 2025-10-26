# app.py

import os
import time
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename

# --- 1. MODIFIED IMPORTS ---
from test_core import (
    extract_text, 
    get_conversational_answer, 
    _store_in_long_term_memory, 
    doc_collection, 
    chat_collection
)

# --- 2. SETUP FLASK APP ---
app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- 3. MODIFIED HTML/JS PAGE ---
@app.route('/')
def index():
    # This HTML/JS now includes a chatbox and history management
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Smart Study Buddy</title>
        <style>
            body { font-family: sans-serif; margin: 2em; }
            #chatBox { border: 1px solid #ccc; padding: 10px; min-height: 200px; max-height: 400px; overflow-y: scroll; margin-bottom: 10px; background-color: #f9f9f9; }
            .userMsg { text-align: right; color: blue; margin-bottom: 5px; }
            .botMsg { text-align: left; color: green; margin-bottom: 5px; white-space: pre-wrap; }
            #uploadStatus { font-style: italic; }
        </style>
    </head>
    <body>
        <h2>1. Upload Document</h2>
        <form id="uploadForm" enctype="multipart/form-data">
            <input type="file" name="file" required>
            <button type="submit">Upload and Process</button>
        </form>
        <p id="uploadStatus"></p>
        
        <hr>
        
        <h2>2. Ask a Question</h2>
        <div id="chatBox"></div>
        <input type="text" id="queryText" placeholder="Ask a question..." style="width: 80%;">
        <button onclick="askQuestion()">Ask</button>
        
        <script>
            // Store chat history globally
            let chatHistory = [];

            document.getElementById('uploadForm').onsubmit = async (e) => {
                e.preventDefault();
                let status = document.getElementById('uploadStatus');
                status.innerText = 'Uploading...';
                let formData = new FormData(e.target);
                
                let response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                
                let result = await response.json();
                status.innerText = result.message;
                
                // Clear history on new upload
                chatHistory = [];
                document.getElementById('chatBox').innerHTML = "";
            };
            
            async function askQuestion() {
                let queryInput = document.getElementById('queryText');
                let query = queryInput.value;
                if (!query) return;

                let chatBox = document.getElementById('chatBox');
                
                // Add user's message
                chatBox.innerHTML += `<div class="userMsg"><strong>You:</strong> ${query}</div>`;
                
                // Add "thinking" message
                chatBox.innerHTML += `<div class="botMsg" id="thinking"><strong>Buddy:</strong> Thinking...</div>`;
                chatBox.scrollTop = chatBox.scrollHeight;

                // Send query AND history
                let response = await fetch('/ask', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        query: query,
                        history: chatHistory 
                    })
                });
                
                let result = await response.json();
                
                document.getElementById('thinking').remove();
                
                // Add bot's answer
                let answer = result.answer;
                let sources = JSON.stringify(result.sources);
                chatBox.innerHTML += `<div class="botMsg"><strong>Buddy:</strong> ${answer}<br><small>Sources: ${sources}</small></div>`;
                
                // Update chat history
                chatHistory.push({"role": "user", "parts": query});
                chatHistory.push({"role": "model", "parts": result.answer});

                queryInput.value = "";
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        </script>
    </body>
    </html>
    """

# --- 4. MODIFIED /upload ENDPOINT ---
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        print(f"File saved to {filepath}")
        
        try:
            print("Extracting text...")
            chunks = extract_text(filepath)
            
            if not chunks:
                return jsonify({'message': 'File processed, but no text found.'}), 200

            print(f"Extracted {len(chunks)} chunks. Adding to ChromaDB...")
            
            documents_to_add = [chunk['content'] for chunk in chunks]
            metadatas_to_add = [{'page': chunk['page_number']} for chunk in chunks]
            ids_to_add = [f"{filename}_chunk_{i}" for i in range(len(chunks))]
            
            try:
                # Clear BOTH collections
                doc_collection.delete(where={"page": {"$gte": 0}})
                chat_collection.delete(where={"page": {"$gte": 0}})
                print("Cleared old document and chat data.")
            except Exception as e:
                print(f"Could not clear collections (it might be empty): {e}")

            # Add to the DOCUMENT collection
            doc_collection.add(
                documents=documents_to_add,
                metadatas=metadatas_to_add,
                ids=ids_to_add
            )
            
            print("Successfully added chunks to doc_collection.")
            os.remove(filepath)
            
            return jsonify({'message': f'File processed and embedded successfully. {len(chunks)} chunks added.'})

        except Exception as e:
            print(f"Error during processing: {e}")
            return jsonify({'error': str(e)}), 500

# --- 5. MODIFIED /ask ENDPOINT ---
@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    if 'query' not in data:
        return jsonify({'error': 'No query provided'}), 400
    
    query_text = data['query']
    chat_history = data.get('history', [])
    
    print(f"Received query: {query_text}")
    print(f"History length: {len(chat_history)}")
    
    # Call the new conversational function
    result = get_conversational_answer(query_text, chat_history)
    
    # Store this turn in long-term memory
    # (Only store if it wasn't an error)
    if not result['answer'].startswith("Error"):
        try:
            _store_in_long_term_memory(query_text, result['answer'])
        except Exception as e:
            print(f"Error saving to long-term memory: {e}")
    
    return jsonify(result)

# --- 6. RUN THE APP ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)