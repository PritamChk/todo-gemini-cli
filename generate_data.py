import json
import uuid
from datetime import datetime, timedelta
import random

TODO_FILE = "todos.json"

def generate_random_todo():
    todo_id = str(uuid.uuid4())
    title = f"Random Todo {random.randint(1, 1000)}"
    content = f"This is the content for random todo {todo_id}. It has some details and might be long or short."

    # Generate random created_at and updated_at within the last 30 days
    created_at = datetime.utcnow() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23), minutes=random.randint(0, 59))
    updated_at = created_at + timedelta(days=random.randint(0, 5), hours=random.randint(0, 23), minutes=random.randint(0, 59))
    if updated_at > datetime.utcnow():
        updated_at = datetime.utcnow()

    checklist = []
    if random.random() > 0.3:  # 70% chance of having a checklist
        for _ in range(random.randint(1, 5)): # 1 to 5 checklist items
            checklist.append({
                "text": f"Check item {random.randint(1, 100)}",
                "completed": random.random() > 0.5 # 50% chance of being completed
            })

    return {
        "id": todo_id,
        "title": title,
        "content": content,
        "checklist": checklist,
        "created_at": created_at.isoformat(),
        "updated_at": updated_at.isoformat()
    }

def generate_random_todos(num_todos=20):
    return [generate_random_todo() for _ in range(num_todos)]

if __name__ == "__main__":
    random_todos = generate_random_todos(num_todos=15) # Generate 15 random todos
    with open(TODO_FILE, "w") as f:
        json.dump(random_todos, f, indent=4)
    print(f"Generated {len(random_todos)} random todos and saved to {TODO_FILE}")