from rag.ingest import (
    load_pdf,
    split_documents,
    save_to_vector_db
)


def index_pdf(filepath):

    print("Loading PDF...")
    docs = load_pdf(filepath)

    print("Splitting document...")
    chunks = split_documents(docs)

    print("Creating vector database...")
    save_to_vector_db(chunks)

    print("PDF indexed successfully!")

    return chunks


