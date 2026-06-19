from rag.ingest import (
    load_pdf,
    split_documents,
    save_to_vector_db
)

filepath = "uploads/sample-insurance-policy.pdf"

print("Loading PDF...")
docs = load_pdf(filepath)

print("Splitting document...")
chunks = split_documents(docs)

def return_chunks():
  return chunks

print("Creating vector database...")
save_to_vector_db(chunks)

print("PDF indexed successfully!")

