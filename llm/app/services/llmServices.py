# rag_core.py
import time
import os
import re
import fitz  # PyMuPDF
import google.generativeai as genai
import chromadb
from sentence_transformers import SentenceTransformer
import pytesseract
from PIL import Image
import io
import docx
from flask import current_app

doc_collection = None
chat_collection = None
embedding_model = None
model = None


def init_rag(app):
    """Called from create_app() AFTER Flask initializes the application context."""
    global doc_collection, chat_collection, embedding_model, model

    with app.app_context():
        try:
            API_KEY = current_app.config.get("GOOGLE_API_KEY")
            if not API_KEY:
                raise RuntimeError("GOOGLE_API_KEY missing in .env")
            genai.configure(api_key=API_KEY)

            print("Loading embedding model...")
            embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

            print("Loading generative model...")
            model = genai.GenerativeModel('gemini-2.0-flash-lite')

            print("Initializing ChromaDB client...")
            chroma_client = chromadb.PersistentClient(path="./chroma_db")

            doc_collection = chroma_client.get_or_create_collection(name="study_buddy_doc_store")
            chat_collection = chroma_client.get_or_create_collection(name="study_buddy_chat_history")

            print("✅ RAG system initialized successfully.")

        except Exception as e:
            print(f"❌ Error during RAG initialization: {e}")


def extract_text(file_path):
    chunks = []
    if file_path.endswith('.txt'):
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
        for paragraph in text.split('\n\n'):
            if paragraph.strip():
                chunks.append({'page_number': 1, 'content': paragraph})

    elif file_path.endswith('.pdf'):
        try:
            doc = fitz.open(file_path)
            for page_num, page in enumerate(doc):
                page_text = page.get_text()
                ocr_text = ""
                for img in page.get_images(full=True):
                    xref = img[0]
                    base_image = doc.extract_image(xref)
                    try:
                        image = Image.open(io.BytesIO(base_image["image"]))
                        ocr_text += pytesseract.image_to_string(image) + "\n"
                    except:
                        pass
                combined = page_text + "\n" + ocr_text
                if combined.strip():
                    chunks.append({'page_number': page_num+1, 'content': combined})
        except:
            return []

    elif file_path.endswith('.docx'):
        try:
            doc_obj = docx.Document(file_path)
            for para in doc_obj.paragraphs:
                if para.text.strip():
                    chunks.append({'page_number': 1, 'content': para.text})
        except:
            return []

    return chunks


def get_answer(query_text):
    global embedding_model, doc_collection

    context_str = ""
    sources = []

    try:
        query_embedding = embedding_model.encode([query_text]).tolist()
        results = doc_collection.query(query_embeddings=query_embedding, n_results=3)

        for i in range(len(results['documents'][0])):
            doc = results['documents'][0][i]
            meta = results['metadatas'][0][i]
            context_str += f"Context from Page {meta['page']}:\n{doc}\n---\n"
            sources.append(meta)

    except:
        context_str = "No relevant context found."

    return context_str, sources


def _rewrite_query(query_text, chat_history):
    if not chat_history:
        return query_text

    formatted_history = "\n".join([f"{msg['role']}: {msg['parts']}" for msg in chat_history])
    prompt = f"""
    Rewrite user question using conversation:
    {formatted_history}
    USER QUESTION: {query_text}
    REWRITTEN:
    """

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except:
        return query_text


def _retrieve_relevant_history(query_text, k=3):
    global embedding_model, chat_collection
    try:
        query_embedding = embedding_model.encode([query_text]).tolist()
        results = chat_collection.query(query_embeddings=query_embedding, n_results=k)
        return "\n---\n".join(results['documents'][0]) if results['documents'] else ""
    except:
        return ""


def _store_in_long_term_memory(user_msg, bot_msg):
    global chat_collection
    text = f"User: {user_msg}\nAssistant: {bot_msg}"
    chat_collection.add(documents=[text], metadatas=[{"page": 0}], ids=[f"chat_{int(time.time())}"])


def get_conversational_answer(query_text, chat_history):
    rewritten_query = _rewrite_query(query_text, chat_history)
    document_context, sources = get_answer(rewritten_query)
    long_term = _retrieve_relevant_history(rewritten_query)
    formatted_history = "\n".join([f"{msg['role']}: {msg['parts']}" for msg in chat_history])

    prompt = f"""
    DOCUMENT:
    {document_context}
    LONG TERM:
    {long_term}
    RECENT CHAT:
    {formatted_history}
    LATEST QUESTION: {query_text}
    """

    response = model.generate_content(prompt)
    return {'answer': response.text, 'sources': sources}
