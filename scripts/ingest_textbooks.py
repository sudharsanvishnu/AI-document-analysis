from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import faiss
import os
import pickle

# Load and split all PDFs and text files
def load_and_chunk(folder_path):
    all_docs = []
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    
    # Create folder if it doesn't exist
    os.makedirs(folder_path, exist_ok=True)
    
    for filename in os.listdir(folder_path):
        if filename.endswith((".pdf", ".txt", ".doc", ".docx")):
            path = os.path.join(folder_path, filename)
            print(f"Processing: {filename}")
            
            if filename.endswith(".pdf"):
                loader = PyMuPDFLoader(path)
                docs = loader.load()
                chunks = splitter.split_documents(docs)
                all_docs.extend(chunks)
            elif filename.endswith(".txt"):
                # Handle text files
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                chunks = splitter.split_text(content)
                # Convert to Document-like objects
                from langchain.schema import Document
                for chunk in chunks:
                    all_docs.append(Document(page_content=chunk, metadata={"source": filename}))
    
    print(f"Loaded {len(all_docs)} chunks from {len([f for f in os.listdir(folder_path) if f.endswith(('.pdf', '.txt', '.doc', '.docx'))])} files")
    return all_docs

# Embed and save FAISS index
def create_vector_store(chunks):
    if not chunks:
        print("❌ No chunks to process. Please upload some textbook files first.")
        return
        
    texts = [doc.page_content for doc in chunks]
    embedder = SentenceTransformer("all-MiniLM-L6-v2")
    print("Creating embeddings...")
    embeddings = embedder.encode(texts, convert_to_tensor=False)

    dim = embeddings[0].shape[0]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    # Create directories if they don't exist
    os.makedirs("embeddings/faiss_index", exist_ok=True)
    
    # Save index and chunks
    faiss.write_index(index, "embeddings/faiss_index/index.faiss")
    with open("embeddings/faiss_index/chunks.pkl", "wb") as f:
        pickle.dump(chunks, f)
    
    print(f"✅ FAISS index created and saved with {len(chunks)} chunks.")

if __name__ == "__main__":
    print("🚀 Starting textbook ingestion...")
    chunks = load_and_chunk("data/textbooks")
    create_vector_store(chunks)
    print("✅ Textbook ingestion completed successfully!")
