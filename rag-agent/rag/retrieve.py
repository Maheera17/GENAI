from langchain_community.vectorstores import FAISS
from rag.ingest import embedding_model
from rank_bm25 import BM25Okapi
import re

VECTOR_PATH = "vectorstore"


def tokenize(text):
    return re.findall(r"\w+", text.lower())


def build_bm25(docs):
    corpus = [
        tokenize(doc.page_content)
        for doc in docs
    ]

    bm25 = BM25Okapi(corpus)

    return bm25, docs


def bm25_search(bm25, docs, query, k=5):

    tokenized_query = tokenize(query)

    scores = bm25.get_scores(tokenized_query)

    ranked_docs = sorted(
        zip(docs, scores),
        key=lambda x: x[1],
        reverse=True
    )

    return [
        doc
        for doc, score in ranked_docs[:k]
    ]


def merge_docs(vector_docs, keyword_docs):

    seen = set()

    combined = []

    for doc in vector_docs + keyword_docs:

        if doc.page_content not in seen:

            combined.append(doc)

            seen.add(doc.page_content)

    return combined


def classify_query(question: str):

    q = question.lower()

    if any(
            word in q
            for word in [
                "summary",
                "summarize",
                "overview"
            ]
    ):

        return "summary"

    return "fact"


def retrieve_documents(question, bm25, chunks):

    db = FAISS.load_local(
        VECTOR_PATH,
        embedding_model,
        allow_dangerous_deserialization=True
    )

    query_type = classify_query(question)

    # Summary queries use the entire document
    if query_type == "summary":

        return chunks, query_type

    # Normal retrieval
    retrieve_k = 25
    final_k = 8
    bm25_k = 6

    vector_docs = db.max_marginal_relevance_search(
        question,
        k=final_k,
        fetch_k=retrieve_k
    )

    keyword_docs = bm25_search(
        bm25,
        chunks,
        question,
        bm25_k
    )

    merged_docs = merge_docs(
        vector_docs,
        keyword_docs
    )

    return merged_docs, query_type