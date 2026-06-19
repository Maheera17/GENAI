from rag.llm import ask_llm


def generate_mcqs(context):

    prompt = f"""
Generate  multiple choice questions from the content.

For each question provide:
- A, B, C, D options
- Correct answer

Context:
{context}

MCQs:
"""

    return ask_llm(prompt)