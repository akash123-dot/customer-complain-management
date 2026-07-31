from pydantic_settings import BaseSettings
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI




class Settings(BaseSettings):
    
    DATABASE_URL: str

    api_key: str
    chat_api_key: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()



"""
gemma2-9b-it (Low Latency / Low Cost): Use for Routing/Intent Classification and simple Field Mutation edits.

llama-3.3-70b-versatile (High Accuracy): Use for Complex Extraction, Initial Risk Assessment, and Defect Analysis.
"""


# main_model = ChatGroq(
#     api_key= settings.api_key,
#     model="llama-3.1-8b-instant",
#     temperature=0.0,
#     max_retries=2,
# )


# analysis_model = ChatGroq(
#     api_key=settings.api_key,
#     model="llama-3.1-8b-instant",
#     temperature=0.0,
#     max_retries=2,
# )


main_model = ChatOpenAI(
    api_key=settings.chat_api_key,
    model="gpt-4o-mini",
    temperature=0.0,
    max_retries=2,
)

analysis_model = ChatOpenAI(
    api_key=settings.chat_api_key,
    model="gpt-4o-mini",
    temperature=0.0,
    max_retries=2,
)


# main_model = ChatGoogleGenerativeAI(
#     api_key=settings.api_key,
#     model="gemini-2.5-flash",
#     temperature=0.0,
#     max_retries=2,
# )

# analysis_model = ChatGoogleGenerativeAI(
#     api_key=settings.api_key,
#     model="gemini-2.5-flash",
#     temperature=0.0,
#     max_retries=2,
# )