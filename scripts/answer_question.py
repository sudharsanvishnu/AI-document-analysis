#!/usr/bin/env python3

import sys
import json
import os
import pickle
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import re

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

def preprocess_text(text):
    """Clean and normalize text for better processing"""
    # Remove extra whitespace and normalize
    text = re.sub(r'\s+', ' ', text.strip())
    
    # Replace unicode quotes and apostrophes
    text = text.replace('\u201c', '"').replace('\u201d', '"')
    text = text.replace('\u2018', "'").replace('\u2019', "'")
    text = text.replace('\u2013', '-').replace('\u2014', '--')
    
    # Remove excessive punctuation
    text = re.sub(r'[.!?]{2,}', '.', text)
    
    return text

def get_relevant_context(question, index, chunks, top_k=None):
    """Retrieve relevant context from embeddings with improved relevance scoring"""
    if top_k is None:
        top_k = Config.TOP_K_CHUNKS
    
    # Load the same model used for creating embeddings
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Preprocess the question
    question = preprocess_text(question)
    
    # Embed the question
    question_embedding = model.encode([question])
    
    # Search for similar chunks
    distances, indices = index.search(question_embedding.astype('float32'), top_k)
    
    # Get relevant chunks with distance scores
    relevant_chunks = []
    for i, distance in zip(indices[0], distances[0]):
        if i < len(chunks):
            chunk = chunks[i]
            # Handle both Document objects and plain strings
            if hasattr(chunk, 'page_content'):
                content = chunk.page_content
            elif hasattr(chunk, 'content'):
                content = chunk.content
            else:
                content = str(chunk)
            
            # Preprocess the chunk content
            content = preprocess_text(content)
            
            # Only include chunks with reasonable relevance
            if distance < Config.RELEVANCE_THRESHOLD:
                relevant_chunks.append((content, distance))
    
    # Sort by relevance (lower distance = more relevant)
    relevant_chunks.sort(key=lambda x: x[1])
    
    # Return only the content, not the distances
    return [chunk for chunk, _ in relevant_chunks]

def generate_ollama_answer(question, context):
    """Generate answer using Ollama with improved prompt engineering"""
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
        
        # Create an improved prompt for better accuracy and formatting
        prompt = f"""You are an expert assistant that provides accurate, well-structured answers based on document content. Your task is to answer questions using only the information provided in the context.

IMPORTANT GUIDELINES:
1. Base your answer ONLY on the provided context
2. If the context doesn't contain enough information to answer the question, clearly state this
3. Provide a well-structured, coherent response
4. Use proper grammar and formatting
5. If the question is unclear, ask for clarification
6. Cite specific information from the context when possible

CONTEXT FROM DOCUMENTS:
{context}

QUESTION: {question}

Please provide a clear, accurate, and well-formed answer based on the context above."""

        # Call Ollama API with optimized parameters
        payload = {
            "model": model_name,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": Config.OLLAMA_TEMPERATURE,
                "top_p": Config.OLLAMA_TOP_P,
                "num_predict": Config.OLLAMA_MAX_TOKENS,
                "repeat_penalty": 1.1  # Reduce repetition
            }
        }
        
        response = requests.post("http://localhost:11434/api/generate", 
                               json=payload, 
                               timeout=Config.OLLAMA_TIMEOUT)
        
        if response.status_code == 200:
            result = response.json()
            answer = result.get("response", "").strip()
            
            # Post-process the answer for better formatting
            answer = post_process_answer(answer)
            
            print(f"✅ Generated answer using Ollama ({model_name})", file=sys.stderr)
            return answer
        else:
            print(f"❌ Ollama API error: {response.status_code}", file=sys.stderr)
            return None
            
    except Exception as e:
        print(f"❌ Error generating with Ollama: {e}", file=sys.stderr)
        return None

def post_process_answer(answer):
    """Clean and format the answer for better presentation"""
    # Remove excessive whitespace
    answer = re.sub(r'\s+', ' ', answer.strip())
    
    # Ensure proper sentence endings
    if answer and not answer.endswith(('.', '!', '?')):
        answer += '.'
    
    # Remove redundant phrases that might be added by the model
    redundant_phrases = [
        "Based on the provided context,",
        "According to the context,",
        "From the context,",
        "The context shows that",
        "Based on the information provided,"
    ]
    
    for phrase in redundant_phrases:
        if answer.startswith(phrase):
            answer = answer[len(phrase):].strip()
            break
    
    return answer

def generate_improved_answer(question, cleaned_chunks):
    """Generate an improved answer by analyzing and combining relevant information"""
    if not cleaned_chunks:
        return "I couldn't find any relevant information in the uploaded documents to answer your question."
    
    # Extract key terms from the question
    question_lower = question.lower()
    question_words = set(re.findall(r'\b\w+\b', question_lower))
    
    # Remove common stop words
    stop_words = {'what', 'how', 'why', 'when', 'where', 'is', 'are', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
    question_words = question_words - stop_words
    
    # Score and rank chunks based on relevance
    scored_chunks = []
    for chunk in cleaned_chunks:
        chunk_lower = chunk.lower()
        chunk_words = set(re.findall(r'\b\w+\b', chunk_lower))
        
        # Calculate relevance score
        word_overlap = len(question_words.intersection(chunk_words))
        phrase_matches = sum(1 for word in question_words if word in chunk_lower)
        
        # Bonus for exact phrase matches
        exact_phrases = 0
        for i in range(len(question_words)):
            for j in range(i+1, len(question_words)+1):
                phrase = ' '.join(list(question_words)[i:j])
                if phrase in chunk_lower:
                    exact_phrases += 1
        
        total_score = word_overlap + phrase_matches * 0.5 + exact_phrases * 2
        scored_chunks.append((total_score, chunk))
    
    # Sort by relevance score
    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    
    # Take the most relevant chunks
    relevant_chunks = [chunk for score, chunk in scored_chunks[:4] if score > 0]
    
    if not relevant_chunks:
        return "I couldn't find specific information related to your question in the uploaded documents."
    
    # Combine the most relevant information intelligently
    combined_text = " ".join(relevant_chunks)
    
    # Clean up the combined text
    combined_text = re.sub(r'\s+', ' ', combined_text)
    
    # Limit length while preserving sentence structure
    max_length = Config.MAX_ANSWER_LENGTH
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
    
    # Format the answer nicely
    answer = f"Based on the available information: {combined_text}"
    
    return post_process_answer(answer)

def generate_answer(question, context_chunks):
    """Generate answer using Ollama or improved local model"""
    
    # Clean and combine context chunks
    cleaned_chunks = []
    for chunk in context_chunks:
        # Clean up the text
        clean_text = preprocess_text(chunk)
        if len(clean_text) > Config.MIN_CHUNK_LENGTH:  # Only include substantial chunks
            cleaned_chunks.append(clean_text)
    
    if not cleaned_chunks:
        return "I couldn't find sufficient relevant information in the uploaded documents to answer your question."
    
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
        print(f"Ollama error: {e}", file=sys.stderr)
    
    # 2. Fallback to improved extraction-based answer
    return generate_improved_answer(question, cleaned_chunks)

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