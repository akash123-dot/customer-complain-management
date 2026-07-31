from typing import TypedDict, Any, List, Optional, Dict, Union
from langchain_core.messages import BaseMessage
from pydantic import BaseModel


class AgentState(TypedDict):
    messages: List[BaseMessage]
    has_user_data: bool 
    user_data: Optional[str]
    user_query: str
    next_input: List[BaseMessage]
    extractor: Any
    editor: Any
    risk_insights: Any

class UserMessage(BaseModel):
    user_query: Any
    # user_data: Optional[Dict[str, Any]] = None
    user_data: Optional[Union[str, Dict[str, Any]]] = None


