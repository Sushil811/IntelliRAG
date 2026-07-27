from typing import TypedDict, Annotated, Sequence, Optional
import operator
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
import json

from app.core.config import settings
from app.services.agents.tools import get_agent_tools

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    tenant_id: str
    document_id: Optional[str]

# Initialize LLM and Tools
llm = ChatGoogleGenerativeAI(
    model=settings.GEMINI_MODEL,
    google_api_key=settings.GEMINI_API_KEY or "dummy_key",
    temperature=0
)
tools = get_agent_tools()
name_to_tool = {t.name: t for t in tools}

# Bind tools to LLM
llm_with_tools = llm.bind_tools(tools)

def should_continue(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1]
    if not getattr(last_message, "tool_calls", None):
        return "end"
    else:
        return "continue"

def call_model(state: AgentState):
    messages = state["messages"]
    # Inject tenant_id and document_id into the prompt context if needed
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

def call_tool(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1]
    
    # Execute the tools
    from langchain_core.messages import ToolMessage
    tool_messages = []
    
    for tool_call in getattr(last_message, "tool_calls", []):
        # Inject tenant_id dynamically to prevent user tampering
        args = tool_call["args"].copy()
        args["tenant_id"] = state["tenant_id"]
        if state.get("document_id") and "document_id" not in args:
            args["document_id"] = state["document_id"]
            
        tool = name_to_tool[tool_call["name"]]
        try:
            response = tool.invoke(args)
        except Exception as e:
            response = str(e)
            
        content = str(response)
        tool_messages.append(ToolMessage(content=content, tool_call_id=tool_call["id"]))
        
    return {"messages": tool_messages}

def build_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("agent", call_model)
    workflow.add_node("action", call_tool)
    
    workflow.set_entry_point("agent")
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "continue": "action",
            "end": END
        }
    )
    workflow.add_edge("action", "agent")
    
    return workflow.compile()

agent_app = build_graph()
