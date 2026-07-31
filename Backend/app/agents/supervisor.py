from app.state import AgentState    
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.settings import main_model
from pydantic import BaseModel, Field, ConfigDict
import asyncio
from app.services.handle_ai_error import handle_ai_error as ai_error

class SupervisorDecision(BaseModel):
    
    next_input: str = Field(
        description="The name of the next worker agent to route to"
    )

    model_config = ConfigDict(extra="forbid")

structured_supervisor = main_model.with_structured_output(SupervisorDecision)


# members = ["ExtractorAgent", "MutatorAgent", "RiskAssessorAgent", "end"]

SYSTEM_PROMPT = """
You are the Supervisor Agent for a Pharmaceutical Quality Management System (QMS) Customer Complaint Intake Copilot.
Your job is to manage the workflow and decide which specialized worker agent to execute next based on the user's input and current state.

### CRITICAL WORKFLOW SHORT-CIRCUIT RULES:
1. **MUTATION IS AN ISOLATED STEP**: 
   - If the user's latest request was an edit/update/change (e.g., "change quantity to 50", "fix expiry date"), route ONLY to `MutatorAgent`.
   - AFTER `MutatorAgent` finishes executing, you MUST immediately select `end`. DO NOT run `RiskAssessorAgent` after a field edit unless the user explicitly requested a risk re-evaluation.

2. **ISOLATED RISK REQUEST**:
   - If the user explicitly asks for risk analysis or classification, route directly to `RiskAssessorAgent`, then select `end`.

### WORKFLOW RULES FOR NEW INGESTION:
1. **ExtractorAgent**: Select ONLY if a new raw complaint text/document is provided AND `extractor_completed` is False.
2. **RiskAssessorAgent**: Select AUTOMATICALLY after a *brand new initial extraction* finishes (`extractor_completed` is True AND `risk_completed` is False AND `mutator_completed` is False).
3. **end**: Select when all requested tasks are finished, after field edits are saved, or when no new user requests remain.

### STRICT ROUTING CONSTRAINTS:
- DO NOT run `RiskAssessorAgent` following a field mutation unless explicitly commanded.
- You MUST strictly output one of: ["ExtractorAgent", "MutatorAgent", "RiskAssessorAgent", "end"].
- Never repeat an agent that just completed its task. Avoid loops.
"""




async def SupervisorAgent(state: AgentState):
    # await asyncio.sleep(2)
    try:
        messages = state.get("messages", [])

        context_info = f"""
        Current State:
        - Agent Running: {state.get("next_input")}
        - User Data Collected: {state.get("has_user_data")}
        - ExtractorAgent - Completed: {bool(state.get("extractor"))}
        - MutatorAgent - Completed/ only user asked to edit: {bool(state.get("editor"))}
        - RiskAssessorAgent - Completed: {bool(state.get("risk_insights"))}
        """
        # full_prompt = SystemMessage(content=f"{SYSTEM_PROMPT}\n\n{context_info}")

        
        response = await structured_supervisor.ainvoke([
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=f"{messages} \n\n{context_info}")
        ])

        print(response)

        return {"next_input": response.next_input}

    except Exception as e:
        ai_error(e)