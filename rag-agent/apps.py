from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import shutil
import os

from index_pdf import return_chunks
from rag.retrieve import retrieve_documents, build_bm25
from rag.llm import ask_llm

from services.summary_service import generate_summary
from services.notes_service import generate_notes
from services.mcq_service import generate_mcqs

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Global BM25 variables
bm25 = None
bm25_docs = None


def init_bm25():
    global bm25, bm25_docs

    chunks = return_chunks()

    bm25, bm25_docs = build_bm25(chunks)


init_bm25()


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):

    filepath = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "message": "Uploaded successfully",
        "filename": file.filename
    }


class Question(BaseModel):
    question: str


@app.post("/ask")
def ask_question(data: Question):

    docs, _ = retrieve_documents(
        data.question,
        bm25,
        bm25_docs
    )

    context = "\n".join(
        doc.page_content
        for doc in docs
    )

    question = data.question.lower()

    # ---------- SUMMARY ----------
    if any(word in question for word in [
        "summary",
        "summarize",
        "overview"
    ]):

        answer = generate_summary(context)

    # ---------- NOTES ----------
    elif "notes" in question:

        answer = generate_notes(context)

    # ---------- MCQ ----------
    elif any(word in question for word in [
        "mcq",
        "multiple choice",
        "quiz"
    ]):

        answer = generate_mcqs(context)

    # ---------- NORMAL QA ----------
    else:

        prompt = f"""
You are an intelligent AI research assistant.

Use the provided context as your primary source of truth.

You may:

- Combine information from multiple sections.
- Reorganize information to improve clarity.
- Summarize concepts.
- Explain ideas in simple language.
- Create comparisons and identify similarities and differences.
- Provide examples and analogies when helpful.
- Answer questions naturally and conversationally.

Rules:

1. Stay grounded in the provided context.
2. Do NOT invent facts, numbers, dates, names, or policy details that are not supported by the context.
3. You may generate explanations and interpretations based on the information found.
4. If information is partially available, provide the best answer possible and clearly mention any missing details.
5. Do not simply copy chunks verbatim unless necessary.

Context:
{context}

Question:
{data.question}

Answer:
"""

        answer = ask_llm(prompt)

    return {
        "answer": answer
    }