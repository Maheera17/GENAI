from rag.llm import ask_llm


def generate_summary(context):

    prompt = f"""
You are an AI research assistant.

Read the following content and generate a well-structured summary.

Cover:
- Main topics
- Important concepts
- Key points
- Conclusions

Context:
{context}

Summary:
"""

    return ask_llm(prompt)