from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from .services.llmServices import (
    extract_text, 
    get_conversational_answer, 
    _store_in_long_term_memory, 
    doc_collection, 
    chat_collection
)

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return "✅ Flask Production Ready!"

@main.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
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
  
  
@main.route('/ask', methods=['POST'])
def askQuery():
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