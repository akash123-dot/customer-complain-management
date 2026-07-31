from app.state import AgentState, UserMessage
from langchain_core.messages import SystemMessage, AIMessage
from app.core.settings import analysis_model
from langchain_core.prompts import ChatPromptTemplate
from app.schemas import DefectAnalysis
from app.services.handle_ai_error import handle_ai_error as ai_error


SYSTEM_PROMPT = """
You are the AI Risk & Quality Compliance Assessor Agent for a Pharmaceutical Quality Management System (QMS).
Your task is to analyze the extracted complaint details and generate a risk assessment based on Good Manufacturing Practice (GMP) standards.

INSTRUCTIONS:
1. Analyze the complaint category and description alongside product and batch details.
2. Determine a suggested severity level:
   - "Critical": Health risks, contamination, cross-contamination, or severe adverse safety issues.
   - "Major": Quality/efficacy failures, discoloration, seal breach, packaging defects, or out-of-specification physical traits without immediate safety threat.
   - "Minor": Cosmetic packaging issues, minor label misalignments, or administrative defects.
3. Formulate a technical Initial Risk Assessment identifying potential root causes (e.g., moisture ingress, seal degradation, thermal exposure).
4. Recommend a Standard QMS Next Action (e.g., "Route to QA Investigation & Issue Replacement").
"""

structured_extractor = analysis_model.with_structured_output(DefectAnalysis)


async def RiskAssessorAgent(state: AgentState):

    """
    This agent is responsible for assessing the risk of the user's input."""
    try:
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("human", "Raw Complaint Input:\n{user_data}\n\nAdditional Instructions:\n{user_query}")
        ])

        chain = prompt | structured_extractor

        response: DefectAnalysis = await chain.ainvoke({
            "user_data": state["user_data"],
            "user_query": state["user_query"]
        })

        print(f"Risk Assessor Output: {response.model_dump(exclude_none=True)}")

        return {"risk_insights": response.model_dump(exclude_none=True), "next_input": state["next_input"] + "RiskAssessorAgent", "messages": state["messages"] + [AIMessage(content="RiskAssessorAgent: risk assessment completion")]}

    except Exception as e:
        ai_error(e)