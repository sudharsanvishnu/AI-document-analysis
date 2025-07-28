import os

# AI Model Configuration
class Config:
    # Local LLM Settings
    USE_OLLAMA = os.getenv('USE_OLLAMA', 'true').lower() == 'true'
    
    # Performance Settings
    USE_GPU = os.getenv('USE_GPU', 'auto')  # auto, true, false
    TORCH_DTYPE = os.getenv('TORCH_DTYPE', 'auto')  # auto, float16, float32
    
    # Answer Generation Settings
    MAX_ANSWER_LENGTH = int(os.getenv('MAX_ANSWER_LENGTH', '800'))
    MIN_CHUNK_LENGTH = int(os.getenv('MIN_CHUNK_LENGTH', '100'))
    TOP_K_CHUNKS = int(os.getenv('TOP_K_CHUNKS', '12'))
    RELEVANCE_THRESHOLD = float(os.getenv('RELEVANCE_THRESHOLD', '1.5'))
    
    # Ollama Settings
    OLLAMA_TEMPERATURE = float(os.getenv('OLLAMA_TEMPERATURE', '0.2'))
    OLLAMA_TOP_P = float(os.getenv('OLLAMA_TOP_P', '0.8'))
    OLLAMA_MAX_TOKENS = int(os.getenv('OLLAMA_MAX_TOKENS', '800'))
    OLLAMA_TIMEOUT = int(os.getenv('OLLAMA_TIMEOUT', '45'))
    
    # Model Priority (1=highest priority)
    # 1. Ollama with preferred models (llama3.2:1b, mistral:7b, mistral:latest)
    # 2. Fallback text extraction
    MODEL_PRIORITY = ['ollama', 'fallback']
    
    # Preferred models in order of preference
    PREFERRED_MODELS = [
        "llama3.2:1b",
        "mistral:7b", 
        "mistral:latest",
        "llama3.1:8b",
        "llama3.1:3b"
    ] 