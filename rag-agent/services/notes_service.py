from rag.llm import ask_llm


def generate_notes(context):

    prompt = f"""
Convert the following content into beginner-friendly study notes.

Include:
- Definitions
- Explanations
- Examples
- Important points

Context:
{context}

Study Notes:
"""

    return ask_llm(prompt)