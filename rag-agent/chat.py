from rag.retrieve import retrieve_documents

while True:
    question = input("Ask a question: ")

    if question.lower() == "exit":
        break

    docs = retrieve_documents(question)

    print("\nRelevant Chunks:\n")

    for doc in docs:
        print(doc.page_content)
        print("------------------")