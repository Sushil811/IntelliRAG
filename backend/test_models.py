import dotenv
dotenv.load_dotenv()
from langchain_google_genai import ChatGoogleGenerativeAI

candidate_models = [
    "models/gemini-1.5-flash",
    "models/gemini-flash-latest",
    "models/gemini-2.5-flash",
    "models/gemini-2.0-flash",
    "models/gemini-pro-latest"
]

for m in candidate_models:
    try:
        print(f"Testing model: {m}...")
        llm = ChatGoogleGenerativeAI(model=m)
        res = llm.invoke("Hi")
        print(f"SUCCESS {m} => {res.content}")
        break
    except Exception as e:
        print(f"FAILED {m} => {e}")
