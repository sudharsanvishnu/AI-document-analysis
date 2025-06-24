#!/usr/bin/env python3

import sys
import json
import os
import pickle
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

from pathlib import Path
import sys

# Add the project root to the path to import config
sys.path.append(str(Path(__file__).parent.parent))
from config import Config

# Ollama imports
try:
    import requests
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    print("Requests library not available. Install with: pip install requests")

def load_embeddings():
    """Load the FAISS index and chunks"""
    # Make sure to look for embeddings relative to the project root
    project_root = Path(__file__).parent.parent
    embeddings_dir = project_root / "embeddings/faiss_index"
    
    if not embeddings_dir.exists():
        raise Exception("No embeddings found. Please upload and process documents first.")
    
    # Load FAISS index
    index_path = embeddings_dir / "index.faiss"
    chunks_path = embeddings_dir / "chunks.pkl"
    
    if not index_path.exists() or not chunks_path.exists():
        raise Exception("Embeddings are incomplete. Please re-process your documents.")
    
    index = faiss.read_index(str(index_path))
    
    with open(chunks_path, 'rb') as f:
        chunks = pickle.load(f)
    
    return index, chunks

def check_ollama_availability():
    """Check if Ollama is running and Mistral model is available"""
    if not OLLAMA_AVAILABLE:
        return False
    
    try:
        # Check if Ollama is running
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get("models", [])
            # Check if Mistral model is available
            mistral_models = [m for m in models if "mistral" in m.get("name", "").lower()]
            if mistral_models:
                print(f"✅ Found Ollama with Mistral models: {[m['name'] for m in mistral_models]}", file=sys.stderr)
                return True
            else:
                print("❌ Ollama is running but no Mistral models found", file=sys.stderr)
                return False
        else:
            print("❌ Ollama is not responding", file=sys.stderr)
            return False
    except Exception as e:
        print(f"❌ Failed to connect to Ollama: {e}", file=sys.stderr)
        return False

def get_relevant_context(question, index, chunks, top_k=8):
    """Retrieve relevant context from embeddings"""
    # Load the same model used for creating embeddings
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Embed the question
    question_embedding = model.encode([question])
    
    # Search for similar chunks
    distances, indices = index.search(question_embedding.astype('float32'), top_k)
    
    # Get relevant chunks
    relevant_chunks = []
    for i in indices[0]:
        if i < len(chunks):
            chunk = chunks[i]
            # Handle both Document objects and plain strings
            if hasattr(chunk, 'page_content'):
                relevant_chunks.append(chunk.page_content)
            elif hasattr(chunk, 'content'):
                relevant_chunks.append(chunk.content)
            else:
                relevant_chunks.append(str(chunk))
    
    return relevant_chunks

def generate_ollama_answer(question, context):
    """Generate answer using Ollama with Mistral"""
    try:
        # Get the first available Mistral model
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code != 200:
            return None
            
        models = response.json().get("models", [])
        
        # Prefer faster, smaller models for better performance
        model_priorities = ["llama3.2:1b", "mistral:7b", "mistral:latest"]
        model_name = None
        
        for priority_model in model_priorities:
            for model in models:
                if priority_model in model.get("name", "").lower():
                    model_name = model["name"]
                    break
            if model_name:
                break
        
        # Fallback to any mistral model if priority models not available
        if not model_name:
            mistral_models = [m for m in models if "mistral" in m.get("name", "").lower()]
            if mistral_models:
                model_name = mistral_models[0]["name"]
        
        if not model_name:
            return None
        
        # Create the prompt
        prompt = f"""You are a helpful assistant that answers questions based on provided document context. Please provide a clear, well-structured answer based only on the information given.

Context from documents:
{context}

Question: {question}

Please answer the question based on the context above. If the answer cannot be found in the context, say so clearly."""

        # Call Ollama API
        payload = {
            "model": model_name,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_p": 0.9,
                "num_predict": 500
            }
        }
        
        response = requests.post("http://localhost:11434/api/generate", 
                               json=payload, 
                               timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            answer = result.get("response", "").strip()
            print(f"✅ Generated answer using Ollama ({model_name})", file=sys.stderr)
            return answer
        else:
            print(f"❌ Ollama API error: {response.status_code}", file=sys.stderr)
            return None
            
    except Exception as e:
        print(f"❌ Error generating with Ollama: {e}", file=sys.stderr)
        return None

def generate_answer(question, context_chunks):
    """Generate answer using Ollama or improved local model"""
    
    # Clean and combine context chunks
    cleaned_chunks = []
    for chunk in context_chunks:
        # Clean up the text
        clean_text = chunk.replace('\n', ' ').replace('\r', ' ')
        # Replace unicode quotes with regular quotes
        clean_text = clean_text.replace('\u201c', '"').replace('\u201d', '"')
        clean_text = clean_text.replace('\u2018', "'").replace('\u2019', "'")
        # Remove extra whitespace
        clean_text = ' '.join(clean_text.split())
        cleaned_chunks.append(clean_text)
    
    context = "\n\n".join(cleaned_chunks)
    
    # Try Ollama first, then fallback to extraction-based answer
    
    # 1. Try Ollama first (if available)
    try:
        if check_ollama_availability():
            answer = generate_ollama_answer(question, context)
            if answer:
                return answer
            print("Ollama failed, using fallback...", file=sys.stderr)
    except Exception as e:
        print(f"Mistral error: {e}", file=sys.stderr)
    

    
    # 2. Fallback to improved extraction-based answer
    return generate_improved_answer(question, cleaned_chunks)

def generate_improved_answer(question, cleaned_chunks):
    """Generate an improved answer by analyzing and combining relevant information"""
    if not cleaned_chunks:
        return "I couldn't find any relevant information in the uploaded documents to answer your question."
    
    question_words = set(question.lower().split())
    question_words.discard('what')
    question_words.discard('how')
    question_words.discard('why')
    question_words.discard('when')
    question_words.discard('where')
    question_words.discard('is')
    question_words.discard('are')
    question_words.discard('the')
    question_words.discard('a')
    question_words.discard('an')
    
    # Score and rank chunks
    scored_chunks = []
    for chunk in cleaned_chunks:
        chunk_words = set(chunk.lower().split())
        overlap = len(question_words.intersection(chunk_words))
        scored_chunks.append((overlap, chunk))
    
    # Sort by relevance score
    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    
    # Take the top chunks and combine them intelligently
    relevant_chunks = [chunk for score, chunk in scored_chunks[:3] if score > 0]
    
    if not relevant_chunks:
        return "I couldn't find specific information related to your question in the uploaded documents."
    
    # Combine the most relevant information
    combined_text = " ".join(relevant_chunks)
    
    # Limit length and ensure proper sentence ending
    max_length = 600
    if len(combined_text) > max_length:
        # Find the last complete sentence within the limit
        truncated = combined_text[:max_length]
        last_period = truncated.rfind('.')
        last_exclamation = truncated.rfind('!')
        last_question = truncated.rfind('?')
        
        sentence_end = max(last_period, last_exclamation, last_question)
        if sentence_end > max_length * 0.7:  # If we found a sentence end in the last 30%
            combined_text = combined_text[:sentence_end + 1]
        else:
            combined_text = combined_text[:max_length] + "..."
    
    return combined_text

def generate_simple_answer(question, context_chunks):
    """Generate a simple answer by finding relevant sentences - kept for backward compatibility"""
    return generate_improved_answer(question, context_chunks)

def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Question argument required"}))
        sys.exit(1)
    
    question = sys.argv[1]
    
    try:
        # Load embeddings
        index, chunks = load_embeddings()
        
        # Get relevant context
        relevant_chunks = get_relevant_context(question, index, chunks)
        
        if not relevant_chunks:
            answer = "No relevant information found in the uploaded documents."
        else:
            # Generate answer
            answer = generate_answer(question, relevant_chunks)
        
        # Return result as JSON
        result = {"answer": answer}
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {"error": str(e)}
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main() 