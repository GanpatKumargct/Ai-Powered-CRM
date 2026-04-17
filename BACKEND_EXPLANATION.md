# Backend & AI Agent Explanation

This document explains what happens under the hood in the backend, especially the AI Engine (`agent.py`). It is written in simple English to explain **what** each part is, **why** it is there, and **how** it works.

---

## 1. The Core AI Brain (`backend/services/agent.py`)

This is the most important file in the project. It handles the "Conversational AI" using LangGraph and LangChain.

### What is it?
It is a small program (called an "Agent") that can read user chat messages, understand what the user wants to do, and automatically extract information to fill out the CRM form. 

### Why is it there?
Without this agent, the user would have to manually type names, dates, and meeting notes into a boring form. The agent acts like a smart assistant that takes a normal sentence (e.g., "I just met Dr. Smith and he was happy") and turns it into organized data for the database.

### How does it work? (The Classes and Methods inside)

- **`ChatGroq` integration**
  - **What:** Connects to the Groq API to use the `llama-3.3-70b-versatile` language model.
  - **Why:** To make the AI incredibly fast and smart without needing a supercomputer locally.
  - **How:** It takes the API key and sends the chat messages back and forth.

- **The `@tool` Functions (`log_interaction`, `edit_interaction`, etc.)**
  - **What:** These are specific actions the AI is allowed to take.
  - **Why:** The AI needs a way to separate plain text answers from "actions" (like logging a meeting or updating a record). 
  - **How:** When the AI reads a prompt, it decides which tool to use. For example, if you say "change the date to tomorrow," the AI magically triggers the `edit_interaction` tool.

- **`AgentState` class (TypedDict)**
  - **What:** This is the memory of the conversation. 
  - **Why:** The AI needs to remember what was said previously and keep track of the extracted form data.
  - **How:** It holds `messages` (chat history) and `structured_data` (the extracted fields like `hcp_name`, `sentiment`, etc.). 

- **`call_model(state)` Method**
  - **What:** The "thinking" step.
  - **Why:** Before taking action, the AI must read the instructions and the user message.
  - **How:** It adds a "System Prompt" giving the AI rules (like "do not ask questions, just fill the form"), sends it all to Groq, and returns the AI's response.

- **`CustomToolNode` Class**
  - **What:** The "action" step. 
  - **Why:** If the AI (in `call_model`) decides it wants to use a tool, this class actually runs the Python tool code.
  - **How:** It grabs the tool name, runs it, and updates the `structured_data` dictionary so the React frontend can grab it. 

- **`should_continue(state)` Method**
  - **What:** The routing logic.
  - **Why:** To prevent infinite loops.
  - **How:** It checks if the AI called a tool. If yes, it goes to `CustomToolNode`. If no, it ends and sends the final answer to the user.

- **`workflow` (StateGraph)**
  - **What:** Connects all the steps together in a circle, created by LangGraph.
  - **How:** Start -> `call_model` -> `should_continue` -> (if tool) -> `CustomToolNode` -> loop back to `call_model`. 

- **`process_chat(message)` Function**
  - **What:** The final entry point.
  - **Why:** FastAPI needs one simple function to call when the frontend sends a chat message.
  - **How:** It feeds the new user message into the LangGraph loop and returns the final Text Response and the Extracted JSON.


---

## 2. API Setup (`backend/main.py` & `backend/routers/`)

### What is it?
This is the FastAPI server. It provides the endpoints (URLs) that the React frontend calls.

### Why is it there?
React (the frontend website) cannot talk directly to the Database or the AI Agent. It needs a secure middleman. FastAPI is that middleman.

### How does it work?
- `main.py` starts the server and connects all the routes together using `app.include_router()`.
- `chat_router.py` receives chat messages from React, sends them to `agent.py`, and sends the AI's response back to React.
- `interaction_router.py` handles the Database CRUD (Create, Read, Update, Delete). If you hit Save on the React form, it comes here to be placed into PostgreSQL permanently.


---

## 3. The Database (`backend/database/` & `backend/models/`)

### What is it?
The setup for PostgreSQL database storage using SQLAlchemy.

### Why is it there?
When you refresh the page or close the app, you don't want to lose all your logged meetings. The database acts as permanent storage.

### How does it work?
- `database.py` holds the connection string (`postgresql://postgres:postgres@localhost:5433/crm_db`) that talks to the Docker container.
- `models.py` defines what a "Table" looks like. It tells the database: "Create a table for interactions with columns like ID, HCP Name, Topics, and Date". 
- `schemas.py` acts as a security guard (Pydantic). It checks the incoming data from React to make sure it is formatted correctly before allowing it to touch the database.

---

## 4. Utility & Testing (`scratch/` Folder & DB Scripts)

### What is it?
The `scratch/` folder contains short Python scripts (like `check_db.py`, `verify_api.py`, or scripts to recreate the database). These files are not connected to the main React website or FastAPI server.

### Why are they there?
When you are building a complex app, things constantly break or change in the database. Instead of guessing if the backend is broken, these "scratch" scripts let you safely test isolated parts of the app without spinning up the whole server.

### How do they work? 
- **The Scratch folder**: Think of it as a sandbox or a dirty notebook. It is a safe place to write temporary "throw-away" code (checking an API connection, testing a single SQL query).
- **Recreate/Check DB scripts**: If the database schema changes (for example, we added a new column like `id`), old data can cause crashes. A script to drop (delete) and recreate the database ensures you have a fresh, clean slate to work on without confusing errors. Other scripts (like `check_db.py`) just quickly reach into PostgreSQL and print out what's inside, so the developer can instantly verify if the AI saved the data correctly without even opening the frontend.
