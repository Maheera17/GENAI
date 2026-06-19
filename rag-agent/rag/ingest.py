from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

embedding_model = HuggingFaceEmbeddings(
   model_name="BAAI/bge-base-en-v1.5"
)

VECTOR_PATH = "vectorstore" 


def load_pdf(filepath):
    loader = PyPDFLoader(filepath)
    return loader.load()


def split_documents(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    return splitter.split_documents(documents)


def save_to_vector_db(chunks):
    db = FAISS.from_documents(
        chunks,
        embedding_model
    )

    db.save_local(VECTOR_PATH)

print("Embedding model used for indexing:")
print(embedding_model.model_name)