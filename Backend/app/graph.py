from langgraph.graph import StateGraph, END
from app.state import AgentState, UserMessage
from app.agents.extractor import ExtractorAgent
from app.agents.mutator import MutatorAgent
from app.agents.risk_assessor import RiskAssessorAgent
from app.agents.supervisor import SupervisorAgent
from langchain_core.messages import HumanMessage

graph = StateGraph(AgentState)


graph.add_node("SupervisorAgent", SupervisorAgent)
graph.add_node("ExtractorAgent", ExtractorAgent)
graph.add_node("MutatorAgent", MutatorAgent)
graph.add_node("RiskAssessorAgent", RiskAssessorAgent)


for worker in ["ExtractorAgent", "MutatorAgent", "RiskAssessorAgent"]:
    graph.add_edge(worker, "SupervisorAgent")


def route_decision(state: AgentState) -> str:
    next_node = state.get("next_input")
    
    if next_node in ["ExtractorAgent", "MutatorAgent", "RiskAssessorAgent"]:
        return next_node
    
    return "end"



graph.add_conditional_edges(
    "SupervisorAgent",
    route_decision,
    {
        "ExtractorAgent": "ExtractorAgent",
        "MutatorAgent": "MutatorAgent",
        "RiskAssessorAgent": "RiskAssessorAgent",
        "end": END
    }
)


graph.set_entry_point("SupervisorAgent")


app = graph.compile()





async def main(message: UserMessage):
    initial_state = {"messages": [HumanMessage(content=message.user_query)],
                     "has_user_data": bool(message.user_data),
                     "user_data": message.user_data,
                     "user_query": message.user_query,
                     "next_input": "",
                     "extractor": None,
                     "editor": None,
                     "risk_insights": None
                     }

    response = await app.ainvoke(initial_state)
    return {
        
        "extractor": response["extractor"],
        "editor": response["editor"],
        "risk_insights": response["risk_insights"]
    }