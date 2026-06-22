from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import shutil
import os
import index_pdf

from rag.retrieve import retrieve_documents, build_bm25
from rag.llm import ask_llm

from services.summary_service import generate_summary
from services.notes_service import generate_notes
from services.mcq_service import generate_mcqs

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Global variables
bm25 = None
bm25_docs = None


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):

    global bm25
    global bm25_docs

    filepath = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Index uploaded PDF
    chunks = index_pdf.index_pdf(filepath)

    # Build BM25
    bm25, bm25_docs = build_bm25(chunks)

    return {
        "message": "Uploaded and indexed successfully",
        "filename": file.filename
    }


class Question(BaseModel):
    question: str


@app.post("/ask")
def ask_question(data: Question):

    global bm25
    global bm25_docs

    if bm25 is None:
        return {
            "answer": "Please upload a PDF first."
        }

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
- Answer naturally and conversationally.

Rules:
1. Stay grounded in the context.
2. Do not invent facts, numbers, names, dates or policy details.
3. You may infer relationships and explain concepts.
4. If information is incomplete, provide the best answer possible and mention missing details.
5. Avoid copying chunks verbatim.

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