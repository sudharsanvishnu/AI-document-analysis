# AI Document Q&A System

A powerful AI-powered document question-answering system that allows you to upload documents and ask intelligent questions about their content. Built with Next.js frontend and Python backend, featuring advanced vector search and multiple AI model support.

## 🚀 Features

### Document Processing
- **Multi-format Support**: Upload PDF, TXT, DOC, and DOCX files
- **Intelligent Chunking**: Automatically splits documents into semantic chunks for optimal search
- **Vector Embeddings**: Uses FAISS and sentence-transformers for fast, accurate semantic search
- **Batch Processing**: Process multiple documents simultaneously

### AI-Powered Question Answering
- **Local AI Models**: Integrated with Ollama for privacy-focused, local AI inference
- **Model Prioritization**: Automatically selects the fastest available model (LLaMA 3.2 1B → Mistral 7B → Mistral Latest)
- **Smart Fallback System**: Falls back to extraction-based answers if AI models are unavailable

### Performance & Reliability
- **Timeout Protection**: 2-minute request timeout with graceful error handling
- **Process Management**: Proper cleanup of background processes
- **Comprehensive Logging**: Detailed error reporting and debugging information
- **Fast Response Times**: Optimized for quick document retrieval and answer generation

### User Experience
- **Modern Web Interface**: Clean, responsive UI built with Next.js and Tailwind CSS
- **Real-time Processing**: Live feedback during document processing
- **Error Handling**: User-friendly error messages and guidance
- **Document Management**: Easy upload, processing, and clearing of documents

## 🛠️ Technology Stack

### 🎨 **Frontend Technologies**
- **[Next.js 14](https://nextjs.org/)** - Modern React framework with App Router for server-side rendering
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript development with enhanced IDE support  
- **[React 18](https://react.dev/)** - Modern UI library with hooks and concurrent features
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework for rapid UI development
- **[React Hot Toast](https://react-hot-toast.com/)** - Beautiful toast notifications for user feedback
- **[React Dropzone](https://react-dropzone.js.org/)** - File upload component with drag-and-drop support
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms with easy validation
- **[Lucide React](https://lucide.dev/)** - Modern icon library with beautiful SVG icons
- **[Axios](https://axios-http.com/)** - HTTP client for API requests

### 🤖 **AI & Machine Learning**
- **[Ollama](https://ollama.ai/)** - Local AI model inference platform
  - **LLaMA 3.2 1B** - Fast, lightweight language model for quick responses
  - **Mistral 7B/Latest** - High-quality language models for complex reasoning
- **[sentence-transformers](https://www.sbert.net/)** - State-of-the-art text embeddings
  - **all-MiniLM-L6-v2** - Efficient sentence embedding model (384 dimensions)
- **[FAISS](https://faiss.ai/)** - Facebook's library for efficient similarity search
- **[PyTorch](https://pytorch.org/)** - Deep learning framework for model operations
- **[Transformers](https://huggingface.co/transformers/)** - Hugging Face transformers library
- **[Accelerate](https://huggingface.co/docs/accelerate/)** - Simplified distributed training and inference

### 🐍 **Backend & Processing**
- **[Python 3.8+](https://www.python.org/)** - Core processing language
- **[LangChain](https://langchain.com/)** - Framework for developing LLM applications
  - **LangChain Community** - Extended integrations and tools
- **[PyMuPDF](https://pymupdf.readthedocs.io/)** - Fast PDF processing and text extraction
- **[Requests](https://requests.readthedocs.io/)** - HTTP library for API communications
- **[Pandas](https://pandas.pydata.org/)** - Data manipulation and analysis
- **[NumPy](https://numpy.org/)** - Numerical computing (via dependencies)

### 🗂️ **Data Storage & Management**
- **File System Storage** - Local document and embedding storage
- **[Pickle](https://docs.python.org/3/library/pickle.html)** - Python object serialization for chunk storage
- **FAISS Index Files** - Binary vector index storage for fast retrieval
- **JSON** - Configuration and API response format

### 🔧 **Development Tools**
- **[ESLint](https://eslint.org/)** - JavaScript/TypeScript linting
- **[PostCSS](https://postcss.org/)** - CSS processing and optimization
- **[Autoprefixer](https://autoprefixer.github.io/)** - Automatic vendor prefixing
- **[Virtual Environment (venv)](https://docs.python.org/3/library/venv.html)** - Isolated Python environment
- **NPM/Yarn** - Package management for Node.js dependencies

### 🏗️ **Architecture Patterns**
- **JAMstack Architecture** - JavaScript, APIs, and Markup
- **Microservices Pattern** - Separate frontend and backend services
- **Vector Database Pattern** - Semantic search with embeddings
- **API-First Design** - RESTful endpoints for all operations
- **Fallback Strategy** - Graceful degradation when AI models fail

### 🌐 **Deployment & Infrastructure**
- **Railway** - Cloud deployment platform (configuration included)
- **Nixpacks** - Build system configuration
- **Docker-ready** - Containerization support via Railway
- **Environment Variables** - Configuration management

## 📋 Prerequisites

### System Requirements
- **Node.js** v18 or higher
- **Python** 3.8 or higher
- **npm** or **yarn** package manager

### AI Models
- **Ollama** (Required for local AI inference):
  - Install Ollama: https://ollama.ai/
  - Pull models: `ollama pull llama3.2:1b` or `ollama pull mistral:7b`

## 🚀 Local Setup & Installation

Follow these detailed steps to set up and run the project locally on your machine.

### Step 1: Prerequisites Check
Before starting, ensure you have the following installed:

```bash
# Check Node.js version (should be v18 or higher)
node --version

# Check npm version
npm --version

# Check Python version (should be 3.8 or higher)
python --version
# or
python3 --version

# Check pip version
pip --version
```

If any of these are missing, install them:
- **Node.js**: Download from [nodejs.org](https://nodejs.org/) 
- **Python**: Download from [python.org](https://python.org/downloads/)

### Step 2: Clone the Repository
```bash
# Clone the repository (replace with actual repository URL)
git clone <repository-url>
cd gen_ai_ui

# Verify you're in the correct directory
ls -la
```

### Step 3: Frontend Setup (Next.js)
```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0

# Alternative: Use yarn if preferred
# yarn install
```

### Step 4: Backend Setup (Python)
```bash
# Create a Python virtual environment (highly recommended)
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate

# Verify virtual environment is active (should show (venv) in prompt)
which python

# Install Python dependencies
pip install -r requirements.txt

# Verify key packages are installed
pip list | grep -E "(faiss|sentence-transformers|langchain)"
```

### Step 5: AI Model Setup

Set up Ollama for local AI capabilities:

#### Ollama Setup (Required for Local AI)
```bash
# 1. Install Ollama
# Visit https://ollama.ai/ and follow installation instructions for your OS

# 2. Verify Ollama installation
ollama --version

# 3. Start Ollama service (if not auto-started)
ollama serve

# 4. In a new terminal, pull AI models
# Fast model (recommended for development):
ollama pull llama3.2:1b

# Alternative models:
ollama pull mistral:7b
ollama pull mistral:latest

# 5. Verify models are installed
ollama list

# 6. Test a model (optional)
ollama run llama3.2:1b "Hello, world!"
```



### Step 6: Create Required Directories
```bash
# Create necessary directories if they don't exist
mkdir -p data/textbooks
mkdir -p data/results
mkdir -p embeddings/faiss_index
mkdir -p temp

# Verify directory structure
ls -la data/
ls -la embeddings/
```

### Step 7: Start the Application

#### Method 1: Development Mode (Recommended)
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate   # On Windows

# Start the Next.js development server
npm run dev

# The application will start on http://localhost:3000
```

#### Method 2: Production Mode
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Step 8: Verify Installation
Open your browser and navigate to `http://localhost:3000`

You should see:
- ✅ Upload Documents tab
- ✅ Ask Questions tab
- ✅ Clean, modern UI interface

### Step 9: Test the Setup
1. **Test Document Upload**:
   - Go to "Upload Documents" tab
   - Try uploading a small PDF or text file
   - Click "Process Documents for AI Questions"
   - Should see success message

2. **Test Question Answering**:
   - Go to "Ask Questions" tab
   - Ask a simple question about your uploaded document
   - Should receive an AI-generated response

### 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint the code
npm run lint

# Run Python scripts directly
python scripts/ingest_textbooks.py
python scripts/answer_question.py "Your question here"
```

### 🚨 Common Setup Issues & Solutions

#### Issue 1: Port 3000 Already in Use
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or start on different port
npm run dev -- -p 3001
```

#### Issue 2: Python Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Issue 3: Ollama Not Found
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama service
ollama serve

# Check Ollama logs
ollama logs
```

#### Issue 4: Permission Errors
```bash
# Fix permission issues on macOS/Linux
chmod +x scripts/*.py
sudo chown -R $USER:$USER .
```

#### Issue 5: Dependencies Installation Fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For Python dependencies
pip cache purge
pip install -r requirements.txt --upgrade
```

### 📝 Quick Start Checklist

- [ ] Node.js v18+ installed
- [ ] Python 3.8+ installed  
- [ ] Repository cloned
- [ ] Node.js dependencies installed (`npm install`)
- [ ] Python virtual environment created and activated
- [ ] Python dependencies installed (`pip install -r requirements.txt`)
- [ ] Ollama installed and models pulled
- [ ] Required directories created
- [ ] Development server started (`npm run dev`)
- [ ] Application accessible at `http://localhost:3000`
- [ ] Upload and question-answering tested

**🎉 You're all set!** Your local AI Document Q&A system is ready to use.

## 📖 How to Use

### 1. Upload Documents
1. Navigate to the **"Upload Documents"** tab
2. **Drag and drop** or **click to select** your documents (PDF, TXT, DOC, DOCX)
3. Click **"Process Documents for AI Questions"** to generate embeddings
4. Wait for processing confirmation ✅

### 2. Ask Questions
1. Switch to the **"Ask Questions"** tab
2. **Type your question** about the uploaded documents
3. **Press Enter** or click **Send**
4. Get an **AI-powered answer** based on document content

### 3. Manage Documents
1. Use **"Clear All Documents"** to remove all uploads and start fresh
2. Upload additional documents to expand your knowledge base
3. Re-process documents after adding new files

## 🎯 Use Cases

### 📚 Educational
- **Research Papers**: Ask questions about academic papers and research documents
- **Textbook Study**: Get explanations and summaries from course materials
- **Literature Analysis**: Analyze themes, characters, and plot points in texts

### 💼 Business
- **Report Analysis**: Extract insights from business reports and presentations
- **Contract Review**: Ask questions about terms, conditions, and clauses
- **Policy Documentation**: Get clarifications on company policies and procedures

### 🔬 Research
- **Data Analysis**: Query findings and methodologies in research documents
- **Literature Review**: Compare information across multiple academic sources
- **Technical Documentation**: Get explanations of complex technical concepts

### 📋 Personal
- **Document Summarization**: Get quick summaries of long documents
- **Information Extraction**: Find specific facts and figures in uploads
- **Learning Aid**: Use as a study companion for various subjects

## 🏗️ Project Structure

```
gen_ai_ui/
├── app/
│   ├── api/                    # Next.js API routes
│   │   ├── ask-question/       # Q&A endpoint
│   │   ├── upload-textbook/    # File upload
│   │   ├── ingest-textbooks/   # Processing endpoint
│   │   └── clear-textbooks/    # Cleanup endpoint
│   ├── components/             # React components
│   │   ├── QuestionAnswering.tsx
│   │   └── TextbookUpload.tsx
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # App layout
│   └── page.tsx               # Main page
├── scripts/                   # Python processing scripts
│   ├── answer_question.py     # Q&A logic
│   └── ingest_textbooks.py    # Document processing
├── data/
│   └── textbooks/             # Uploaded documents
├── embeddings/
│   └── faiss_index/           # Generated embeddings
├── venv/                      # Python virtual environment
├── requirements.txt           # Python dependencies
├── package.json               # Node.js dependencies
└── README.md                  # This file
```

## ⚙️ Configuration

### Environment Variables
```bash
# Optional: Disable Ollama if needed
USE_OLLAMA=false
```

### Model Configuration
The system automatically prioritizes models in this order:
1. **llama3.2:1b** (Fastest, good quality)
2. **mistral:7b** (Balanced speed/quality)
3. **mistral:latest** (High quality, slower)
4. **Extraction-based** (Final fallback)

## 🔧 API Endpoints

### POST `/api/upload-textbook`
Upload document files for processing.

### POST `/api/ingest-textbooks`
Process uploaded documents and generate embeddings.

### POST `/api/ask-question`
Submit questions and receive AI-generated answers.
```json
{
  "question": "What is artificial intelligence?"
}
```

### DELETE `/api/clear-textbooks`
Remove all documents and embeddings.

## 🚨 Troubleshooting

### Common Issues

#### "No embeddings found" Error
- **Solution**: Upload documents and click "Process Documents" first
- **Check**: Ensure `data/textbooks/` contains your files
- **Verify**: Look for `embeddings/faiss_index/` directory

#### Slow Response Times
- **Switch Models**: Use `llama3.2:1b` for faster responses
- **Check Ollama**: Ensure Ollama service is running
- **System Resources**: Verify sufficient RAM/CPU available

#### AI Model Errors
- **Ollama Issues**: Run `ollama list` to check installed models
- **Fallback**: System will use extraction-based answers if AI fails

### Performance Tips
- Use **smaller models** (llama3.2:1b) for faster responses
- **Limit document size** for better processing speed
- **Clear old documents** periodically to free up space
- Ensure **Ollama service** is running before starting the app

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature-name`
3. **Make** your changes with proper testing
4. **Commit** changes: `git commit -m 'Add feature'`
5. **Push** to branch: `git push origin feature-name`
6. **Submit** a pull request

## 📄 License

This project is open source and available under the **MIT License**.

## 📞 Support

If you encounter issues:

1. **Check** the troubleshooting section above
2. **Verify** all prerequisites are installed
3. **Review** console logs for error details
4. **Create** an issue with detailed information

---

🤖 **Happy Questioning!** Transform your documents into an intelligent, searchable knowledge base with the power of AI. 