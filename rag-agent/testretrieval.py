from rag.retrieve import retrieve_documents

question = input("Ask a question: ")

docs = retrieve_documents(question)

for i, doc in enumerate(docs, 1):
    print("\n------------------")
    print(f"Chunk {i}")
    print(doc.page_content)