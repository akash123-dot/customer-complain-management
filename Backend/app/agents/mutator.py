from app.state import AgentState, UserMessage
from langchain_core.messages import SystemMessage, AIMessage
from app.core.settings import main_model
from langchain_core.prompts import ChatPromptTemplate
from app.schemas import ExtractedComplaintData
from app.services.handle_ai_error import handle_ai_error as ai_error

SYSTEM_PROMPT = """
You are the Field Editor (Mutator) Agent for a Pharmaceutical Quality Management System (QMS).
Your task is to process user edit requests and update existing customer complaint fields.

INSTRUCTIONS:
1. Extract ONLY the fields that the user explicitly requests to edit, modify, or correct.
2. For any field not mentioned in the user's edit request, leave its value as null/None.
3. Do not infer, guess, or fabricate field values that were not requested by the user.
"""

structured_extractor = main_model.with_structured_output(ExtractedComplaintData)
async def MutatorAgent(state: AgentState):

    """
    This agent is responsible for mutating the user's input."""
    try:
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("human", "Raw Complaint Input:\n{user_data}\n\nAdditional Instructions:\n{user_query}")
        ])

        chain = prompt | structured_extractor

        response: ExtractedComplaintData = await chain.ainvoke({
                "user_data": state["user_data"],
                "user_query": state["user_query"]
            })

        exe_dict = response.model_dump(exclude_none=True)

        print(f"Editor Output: {exe_dict}")

        return {"editor": exe_dict, "extractor": exe_dict, "next_input": state["next_input"] + "MutatorAgent", "messages": state["messages"] + [AIMessage(content="MutatorAgent:Field edit completion")]} 

    except Exception as e:
        ai_error(e)