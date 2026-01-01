import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings  # the NEW version
from django.conf import settings

load_dotenv()

PDF_DIR = "backend/assessments/media/ise"
INDEX_DIR = "backend/assessments/media/iseindex"

def build():
    docs = []
    for fname in os.listdir(PDF_DIR):
        if fname.endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(PDF_DIR, fname))
            docs.extend(loader.load())

    # Split into smaller chunks (e.g. 1000 tokens)
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    split_docs = splitter.split_documents(docs)

    # Embed
    embeddings = OpenAIEmbeddings(api_key="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")
    vectorstore = FAISS.from_documents(split_docs, embeddings)
    vectorstore.save_local(INDEX_DIR)
    print("✅ Index built successfully.")

if __name__ == "__main__":
    build()
