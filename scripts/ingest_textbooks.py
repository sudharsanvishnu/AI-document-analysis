from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import faiss
import os
import pickle
import re
import sys
from pathlib import Path

# Add the project root to the path to import config
sys.path.append(str(Path(__file__).parent.parent))
from config import Config

# Load and split all PDFs and text files
def load_and_chunk(folder_path):
    all_docs = []
    
    # Improved text splitter with better parameters for accuracy
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,  # Increased chunk size for better context
        chunk_overlap=150,  # Increased overlap for better continuity
        length_function=len,
        separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""]  # Better separators
    )
    
    # Create folder if it doesn't exist
    os.makedirs(folder_path, exist_ok=True)
    
    for filename in os.listdir(folder_path):
        if filename.endswith((".pdf", ".txt", ".doc", ".docx")):
            path = os.path.join(folder_path, filename)
            print(f"Processing: {filename}")
            
            if filename.endswith(".pdf"):
                loader = PyMuPDFLoader(path)
                docs = loader.load()
                
                # Preprocess documents for better chunking
                for doc in docs:
                    # Clean the content
                    doc.page_content = preprocess_content(doc.page_content)
                
                chunks = splitter.split_documents(docs)
                all_docs.extend(chunks)
            elif filename.endswith(".txt"):
                # Handle text files
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Preprocess content
                content = preprocess_content(content)
                
                chunks = splitter.split_text(content)
                # Convert to Document-like objects
                from langchain.schema import Document
                for chunk in chunks:
                    all_docs.append(Document(page_content=chunk, metadata={"source": filename}))
    
    print(f"Loaded {len(all_docs)} chunks from {len([f for f in os.listdir(folder_path) if f.endswith(('.pdf', '.txt', '.doc', '.docx'))])} files")
    return all_docs

def preprocess_content(content):
    """Clean and normalize document content for better processing"""
    # Remove excessive whitespace
    content = re.sub(r'\s+', ' ', content)
    
    # Replace unicode characters
    content = content.replace('\u201c', '"').replace('\u201d', '"')
    content = content.replace('\u2018', "'").replace('\u2019', "'")
    content = content.replace('\u2013', '-').replace('\u2014', '--')
    
    # Remove excessive punctuation
    content = re.sub(r'[.!?]{2,}', '.', content)
    
    # Remove page numbers and headers/footers (common patterns)
    content = re.sub(r'\b(Page|page)\s+\d+\b', '', content)
    content = re.sub(r'\b\d+\s+of\s+\d+\b', '', content)
    
    return content.strip()

# Embed and save FAISS index
def create_vector_store(chunks):
    if not chunks:
        print("❌ No chunks to process. Please upload some textbook files first.")
        return
        
    texts = [doc.page_content for doc in chunks]
    
    # Filter out very short chunks that might not be useful
    filtered_texts = []
    filtered_chunks = []
    for text, chunk in zip(texts, chunks):
        if len(text.strip()) > Config.MIN_CHUNK_LENGTH:  # Only keep chunks with substantial content
            filtered_texts.append(text)
            filtered_chunks.append(chunk)
    
    if not filtered_texts:
        print("❌ No substantial chunks found after filtering.")
        return
    
    print(f"Using {len(filtered_texts)} substantial chunks for embedding...")
    
    embedder = SentenceTransformer("all-MiniLM-L6-v2")
    print("Creating embeddings...")
    embeddings = embedder.encode(filtered_texts, convert_to_tensor=False)

    dim = embeddings[0].shape[0]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    # Create directories if they don't exist
    os.makedirs("embeddings/faiss_index", exist_ok=True)
    
    # Save index and chunks
    faiss.write_index(index, "embeddings/faiss_index/index.faiss")
    with open("embeddings/faiss_index/chunks.pkl", "wb") as f:
        pickle.dump(filtered_chunks, f)
    
    print(f"✅ FAISS index created and saved with {len(filtered_chunks)} chunks.")

if __name__ == "__main__":
    print("🚀 Starting textbook ingestion...")
    chunks = load_and_chunk("data/textbooks")
    create_vector_store(chunks)
    print("✅ Textbook ingestion completed successfully!")
