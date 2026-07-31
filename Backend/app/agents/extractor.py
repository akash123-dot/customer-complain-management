from app.state import AgentState, UserMessage
from langchain_core.messages import AIMessage
from app.core.settings import main_model
from langchain_core.prompts import ChatPromptTemplate
from app.schemas import ExtractedComplaintData
from app.services.handle_ai_error import handle_ai_error as ai_error

SYSTEM_PROMPT = """You are an expert QMS Document Extraction Agent for a pharmaceutical company.
Analyze the raw complaint text or document provided and extract all relevant fields into the structured schema.
If a field is missing or not mentioned in the text, leave it as null/None. Do not guess or fabricate information.
"""

structured_extractor = main_model.with_structured_output(ExtractedComplaintData)
async def ExtractorAgent(state: AgentState):

    """
    This agent is responsible for extracting information from the user's input."""
    try:
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("human", "Raw Complaint Input:\n{user_data}\n\nAdditional Instructions:\n{user_query}")
        ])

        chain = prompt | structured_extractor

        extracted_data: ExtractedComplaintData = await chain.ainvoke({
            "user_data": state["user_data"],
            "user_query": state["user_query"]
        })

        extracted_dict = extracted_data.model_dump(exclude_none=True)

        print(f"extracted_dict: {extracted_dict}")

        return {"extractor": extracted_dict, "next_input": state["next_input"] + "ExtractorAgent", "messages": state["messages"] + [AIMessage(content="ExtractorAgent: Field extraction completion")]}

    except Exception as e:
        ai_error(e)