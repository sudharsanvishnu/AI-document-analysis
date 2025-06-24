import os

# AI Model Configuration
class Config:
    # Local LLM Settings
    USE_OLLAMA = os.getenv('USE_OLLAMA', 'true').lower() == 'true'
    
    # Performance Settings
    USE_GPU = os.getenv('USE_GPU', 'auto')  # auto, true, false
    TORCH_DTYPE = os.getenv('TORCH_DTYPE', 'auto')  # auto, float16, float32
    
    # Model Priority (1=highest priority)
    # 1. Ollama with preferred models (llama3.2:1b, mistral:7b, mistral:latest)
    # 2. Fallback text extraction
    MODEL_PRIORITY = ['ollama', 'fallback'] 