#!/bin/bash

# Activate virtual environment and run scripts
echo "Activating virtual environment..."
source venv/bin/activate

echo "Virtual environment activated!"
echo "You can now run:"
echo "  python scripts/ingest_textbooks.py"
echo "  python scripts/answer_question.py \"your question here\""
echo ""
echo "To deactivate, run: deactivate" 