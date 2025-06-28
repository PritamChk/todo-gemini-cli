from fastapi import FastAPI, Request, Body, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from typing import List, Dict
import uuid
import json
from datetime import datetime

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

TODO_FILE = "todos.json"

# In-memory database
todos: List[Dict] = []

def load_todos():
    global todos
    try:
        with open(TODO_FILE, "r") as f:
            todos = json.load(f)
    except FileNotFoundError:
        todos = []

def save_todos():
    with open(TODO_FILE, "w") as f:
        json.dump(todos, f, indent=4)

@app.on_event("startup")
def startup_event():
    load_todos()

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "todos": todos})

@app.get("/todos/", response_model=List[Dict])
async def get_todos():
    load_todos()
    return todos

@app.post("/todos/", response_model=Dict)
async def create_todo(todo: Dict = Body(...)):
    now = datetime.utcnow().isoformat()
    new_note = {
        "id": str(uuid.uuid4()),
        "title": todo["title"],
        "content": todo["content"],
        "checklist": todo.get("checklist", []), # Initialize checklist as empty list if not provided
        "created_at": now,
        "updated_at": now,
        "completed": False # New field for completion status
    }
    todos.append(new_note)
    save_todos()
    return new_note

@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str):
    global todos
    note_index = -1
    for i, note in enumerate(todos):
        if note["id"] == todo_id:
            note_index = i
            break
    
    if note_index != -1:
        todos.pop(note_index)
        save_todos()
        return {"message": "Todo deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Todo not found")

@app.put("/todos/{todo_id}", response_model=Dict)
async def update_todo(todo_id: str, todo_update: Dict = Body(...)):
    for note in todos:
        if note["id"] == todo_id:
            note["title"] = todo_update.get("title", note["title"])
            note["content"] = todo_update.get("content", note["content"])
            note["checklist"] = todo_update.get("checklist", note.get("checklist", []))
            note["completed"] = todo_update.get("completed", note.get("completed", False))
            note["updated_at"] = datetime.utcnow().isoformat()
            save_todos()
            return note
    raise HTTPException(status_code=404, detail="Todo not found")

@app.get("/todos/count", response_model=Dict)
async def get_todos_count():
    load_todos()
    return {"count": len(todos)}