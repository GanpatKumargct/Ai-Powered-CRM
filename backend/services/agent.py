import os
from typing import Annotated, TypedDict
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, ToolMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

# --- Tools ---

@tool
def log_interaction(
    hcp_name: str = "", 
    interaction_type: str = "Meeting", 
    date: str = "", 
    time: str = "", 
    attendees: str = "", 
    topics_discussed: str = "", 
    materials_shared: str = "", 
    samples_distributed: str = "", 
    sentiment: str = "", # Should be one of: "Positive", "Neutral", "Negative"
    outcomes: str = "", 
    follow_up_actions: str = ""
):
    """
    Log a new interaction with a Healthcare Professional (HCP).
    Extracts structured data for logging in the CRM.
    """
    return {
        "action": "log",
        "data": {
            "hcp_name": hcp_name,
            "interaction_type": interaction_type,
            "date": date,
            "time": time,
            "attendees": attendees,
            "topics_discussed": topics_discussed,
            "materials_shared": materials_shared,
            "samples_distributed": samples_distributed,
            "sentiment": sentiment,
            "outcomes": outcomes,
            "follow_up_actions": follow_up_actions
        }
    }

@tool
def edit_interaction(field_name: str, new_value: str):
    """
    Edit a specific field of the current interaction.
    Valid field_names: 'hcp_name', 'interaction_type', 'date', 'time', 'attendees', 'topics_discussed', 'materials_shared', 'samples_distributed', 'sentiment', 'outcomes', 'follow_up_actions'.
    """
    return {
        "action": "edit",
        "data": {
            field_name: new_value
        }
    }

@tool
def suggest_next_action(notes: str = ""):
    """
    Suggest follow-up actions based on the interaction notes.
    """
    return {
        "action": "suggest",
        "data": "Based on the notes, suggest sending a follow-up email and scheduling a call next week."
    }

@tool
def summarize_interaction(notes: str = ""):
    """
    Convert long notes into a short summary.
    """
    return {
        "action": "summarize",
        "data": f"Summarized notes: {notes[:30]}..."
    }

@tool
def fetch_interaction_history(hcp_name: str = ""):
    """
    Retrieve past interactions for a specific HCP.
    """
    return {
        "action": "fetch",
        "data": f"Fetched past interactions for {hcp_name} from database."
    }

tools = [log_interaction, edit_interaction, suggest_next_action, summarize_interaction, fetch_interaction_history]

# --- State ---
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    structured_data: dict

# --- Nodes ---
def call_model(state: AgentState):
    llm = ChatGroq(model_name="llama-3.3-70b-versatile", api_key=os.getenv("GROQ_API_KEY", "dummy"))
    llm_with_tools = llm.bind_tools(tools)
    
    messages = state["messages"]
    if not any(isinstance(m, SystemMessage) for m in messages):
        sys_msg = SystemMessage(content="""You are an AI CRM assistant for logging Healthcare Professional (HCP) interactions. 
Your goal is to extract as much detail as possible from the conversation to fill out a CRM form.

CRITICAL TOOL CALLING RULES:
- ALWAYS use the built-in standard JSON tool calling mechanism. 
- Use the 'log_interaction' tool heavily.

GUIDELINES:
1. When a user provides interaction details, ALWAYS call the 'log_interaction' tool.
2. PASS ALL PARAMETERS you can find. If a parameter is missing, use an empty string "" BUT definitely extract hcp_name, interaction_type, and topics_discussed.
3. DATE FORMAT: Always pass dates to the tools in YYYY-MM-DD ISO format (e.g., '2026-04-16'). If the user says 'today', use the current date.
4. If a user asks to CHANGE a specific piece of info, use 'edit_interaction'.
5. DO NOT ask the user to fill the form. Your job is to fill it for them automatically from the chat.
6. SENTIMENT: Always use one of these exact values: "Positive", "Neutral", or "Negative".
7. Be conversational but efficient.
8. If the user's input is unclear, nonsensical, or lacks any relevant CRM information, DO NOT attempt to guess or log incomplete data. Instead, respond politely with "I couldn't get your words, will you please simplify it?".
""")
        messages = [sys_msg] + messages

    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

class CustomToolNode:
    def __init__(self, tools):
        self.tools = {tool.name: tool for tool in tools}

    def __call__(self, state: AgentState):
        messages = state["messages"]
        last_message = messages[-1]
        
        results = []
        structured_data_updates = {"action": None, "data": {}}
        
        for tool_call in last_message.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]
            tool_instance = self.tools[tool_name]
            
            try:
                output = tool_instance.invoke(tool_args)
            except Exception as e:
                output = str(e)
            
            if isinstance(output, dict) and "action" in output:
                new_action = output.get("action")
                new_data = output.get("data", {})
                
                if new_action == "log":
                    structured_data_updates["action"] = "log"
                    # Log provides baseline, but we don't want to overwrite previous edits if they happened first
                    # Actually standard dict update:
                    for k, v in new_data.items():
                        if k not in structured_data_updates["data"] or not structured_data_updates["data"][k]:
                            structured_data_updates["data"][k] = v
                elif new_action == "edit":
                    if not structured_data_updates["action"] or structured_data_updates["action"] not in ["log"]:
                         structured_data_updates["action"] = "edit"
                    if isinstance(new_data, dict):
                         structured_data_updates["data"].update(new_data)
                elif not structured_data_updates["action"]:
                    structured_data_updates["action"] = new_action
                    structured_data_updates["data"] = new_data

            results.append(
                ToolMessage(
                    content=str(output),
                    name=tool_name,
                    tool_call_id=tool_call["id"]
                )
            )
            
        # Clean up empty action if no matching tools fired
        if not structured_data_updates.get("action"):
            structured_data_updates = {}

            
        return {"messages": results, "structured_data": structured_data_updates}

def should_continue(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        return "tools"
    return END

# --- Graph Definition ---
workflow = StateGraph(AgentState)

workflow.add_node("agent", call_model)
workflow.add_node("tools", CustomToolNode(tools))

workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue, ["tools", END])
workflow.add_edge("tools", "agent")

app = workflow.compile()

def process_chat(message: str) -> dict:
    inputs = {
        "messages": [HumanMessage(content=message)],
        "structured_data": {}
    }
    
    try:
        final_state = app.invoke(inputs)
        final_message = final_state["messages"][-1].content
        structured_data = final_state.get("structured_data", {})
        
        return {
            "text_response": final_message,
            "structured_data": structured_data
        }
    except Exception as e:
        return {
            "text_response": f"Error: {str(e)}",
            "structured_data": None
        }
