#!/usr/bin/env python3

import sys
import json
from pathlib import Path

# Add the project root to the path
sys.path.append(str(Path(__file__).parent.parent))
from scripts.answer_question import main as answer_question_main

def test_answer_quality():
    """Test the answer quality improvements"""
    
    # Test questions
    test_questions = [
        "What is machine learning?",
        "How does neural network work?",
        "Explain the concept of deep learning",
        "What are the main types of machine learning algorithms?",
        "How do you evaluate a machine learning model?"
    ]
    
    print("🧪 Testing answer quality improvements...")
    print("=" * 50)
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n📝 Test {i}: {question}")
        print("-" * 30)
        
        try:
            # Temporarily modify sys.argv to simulate command line call
            original_argv = sys.argv.copy()
            sys.argv = ['test_script', question]
            
            # Capture stdout to get the JSON response
            import io
            import contextlib
            
            with io.StringIO() as buf:
                with contextlib.redirect_stdout(buf):
                    answer_question_main()
                output = buf.getvalue()
            
            # Parse the JSON response
            try:
                result = json.loads(output.strip())
                if 'answer' in result:
                    answer = result['answer']
                    print(f"✅ Answer: {answer}")
                    
                    # Basic quality checks
                    if len(answer) > 50:
                        print("✅ Answer length: Good")
                    else:
                        print("⚠️  Answer length: Too short")
                    
                    if answer.endswith(('.', '!', '?')):
                        print("✅ Answer formatting: Good")
                    else:
                        print("⚠️  Answer formatting: Missing proper ending")
                        
                elif 'error' in result:
                    print(f"❌ Error: {result['error']}")
                else:
                    print(f"❌ Unexpected response format: {result}")
                    
            except json.JSONDecodeError:
                print(f"❌ Failed to parse JSON response: {output}")
                
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
        finally:
            # Restore original sys.argv
            sys.argv = original_argv
    
    print("\n" + "=" * 50)
    print("✅ Answer quality testing completed!")

if __name__ == "__main__":
    test_answer_quality() 