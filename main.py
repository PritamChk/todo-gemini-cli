from fastapi import FastAPI, Request, Body, HTTPException, Query
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from typing import List, Dict, Optional
import uuid
import json
from datetime import datetime
import os

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

TODO_FILE = "todos.json"

def load_todos():
    if not os.path.exists(TODO_FILE):
        with open(TODO_FILE, "w") as f:
            json.dump([], f) # Initialize with empty list if file doesn't exist
    with open(TODO_FILE, "r") as f:
        return json.load(f)

def save_todos(todos_data: List[Dict]):
    with open(TODO_FILE, "w") as f:
        json.dump(todos_data, f, indent=4)

@app.on_event("startup")
def startup_event():
    # Ensure todos.json exists and is initialized
    load_todos()

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/todos/")
async def get_todos(
    page: int = 1,
    limit: int = 10,
    sort_by: Optional[str] = Query("created_at_desc"),
    filter_date_from: Optional[str] = None,
    filter_date_to: Optional[str] = None,
    filter_completion: Optional[str] = Query("all")
):
    all_todos = load_todos()
    current_todos = list(all_todos) # Create a mutable copy for filtering/sorting

    # Apply date filtering
    if filter_date_from or filter_date_to:
        from_date = datetime.fromisoformat(filter_date_from).replace(hour=0, minute=0, second=0, microsecond=0) if filter_date_from else None
        to_date = datetime.fromisoformat(filter_date_to).replace(hour=23, minute=59, second=59, microsecond=999999) if filter_date_to else None

        current_todos = [note for note in current_todos if 
                         (not from_date or datetime.fromisoformat(note["created_at"]) >= from_date) and 
                         (not to_date or datetime.fromisoformat(note["created_at"]) <= to_date)]

    # Apply completion filtering
    if filter_completion == "completed":
        current_todos = [note for note in current_todos if note.get("completed", False)]
    elif filter_completion == "incomplete":
        current_todos = [note for note in current_todos if not note.get("completed", False)]

    # Apply sorting
    if sort_by:
        if sort_by == "created_at_desc":
            current_todos.sort(key=lambda x: datetime.fromisoformat(x["created_at"]), reverse=True)
        elif sort_by == "created_at_asc":
            current_todos.sort(key=lambda x: datetime.fromisoformat(x["created_at"]))
        elif sort_by == "updated_at_desc":
            current_todos.sort(key=lambda x: datetime.fromisoformat(x["updated_at"]), reverse=True)
        elif sort_by == "updated_at_asc":
            current_todos.sort(key=lambda x: datetime.fromisoformat(x["updated_at"]))
        elif sort_by == "title_asc":
            current_todos.sort(key=lambda x: x["title"].lower())
        elif sort_by == "title_desc":
            current_todos.sort(key=lambda x: x["title"].lower(), reverse=True)
        elif sort_by == "completed_asc":
            current_todos.sort(key=lambda x: x.get("completed", False))
        elif sort_by == "completed_desc":
            current_todos.sort(key=lambda x: x.get("completed", False), reverse=True)

    total_filtered_todos = len(current_todos)
    total_pages = (total_filtered_todos + limit - 1) // limit
    
    start = (page - 1) * limit
    end = start + limit
    paginated_todos = current_todos[start:end]

    return {"todos": paginated_todos, "total_pages": total_pages, "current_page": page, "total_todos": total_filtered_todos}

@app.post("/todos/", response_model=Dict)
async def create_todo(todo: Dict = Body(...)):
    todos_data = load_todos()
    now = datetime.utcnow().isoformat()
    new_note = {
        "id": str(uuid.uuid4()),
        "title": todo["title"],
        "content": todo["content"],
        "checklist": todo.get("checklist", []),
        "created_at": now,
        "updated_at": now,
        "completed": False
    }
    todos_data.append(new_note)
    save_todos(todos_data)
    return new_note

@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str):
    todos_data = load_todos()
    note_index = -1
    for i, note in enumerate(todos_data):
        if note["id"] == todo_id:
            note_index = i
            break
    
    if note_index != -1:
        todos_data.pop(note_index)
        save_todos(todos_data)
        return {"message": "Todo deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Todo not found")

@app.put("/todos/{todo_id}", response_model=Dict)
async def update_todo(todo_id: str, todo_update: Dict = Body(...)):
    todos_data = load_todos()
    for note in todos_data:
        if note["id"] == todo_id:
            note["title"] = todo_update.get("title", note["title"])
            note["content"] = todo_update.get("content", note["content"])
            note["checklist"] = todo_update.get("checklist", note.get("checklist", []))
            note["completed"] = todo_update.get("completed", note.get("completed", False))
            note["updated_at"] = datetime.utcnow().isoformat()
            save_todos(todos_data)
            return note
    raise HTTPException(status_code=404, detail="Todo not found")
