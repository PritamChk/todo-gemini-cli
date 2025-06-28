# Gemini Notes - A Feature-Rich Todo Application

Gemini Notes is a simple yet powerful web-based todo application built with FastAPI for the backend and a modern, responsive frontend using HTML, CSS (Tailwind CSS), and JavaScript. It allows users to manage their tasks efficiently with features like persistence, checklists, sorting, and filtering.

## 🛠️ Tech Stack

This application is built using the following technologies:

- **Backend:**

  - [Python](https://www.python.org/) [![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
  - [FastAPI](https://fastapi.tiangolo.com/) [![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  - [Uvicorn](https://www.uvicorn.org/) [![Uvicorn](https://img.shields.io/badge/Uvicorn-F76A0C?style=for-the-badge&logo=uvicorn&logoColor=white)](https://www.uvicorn.org/)
  - [Pipenv](https://pipenv.pypa.io/en/latest/) [![Pipenv](https://img.shields.io/badge/Pipenv-2196F3?style=for-the-badge&logo=pipenv&logoColor=white)](https://pipenv.pypa.io/en/latest/)

- **Frontend:**

  - [HTML5](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5) [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
  - [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS) [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
  - [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  - [Tailwind CSS](https://tailwindcss.com/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

- **Data Storage:**
  - JSON File System

## ✨ Features

| Feature                | Description                                                                                |
| :--------------------- | :----------------------------------------------------------------------------------------- |
| **Create/Edit/Delete** | Full CRUD operations for your notes.                                                       |
| **Data Persistence**   | All your notes are saved to `todos.json` and persist across application restarts.          |
| **Checklists**         | Add multiple checklist items to each note, mark them as complete, and track your progress. |
| **Timestamps**         | Automatically records `Created At` and `Modified At` times for each note.                  |
| **Sorting**            | Sort notes by:                                                                             |
|                        | - Created Date (Newest/Oldest First)                                                       |
|                        | - Modified Date (Newest/Oldest First)                                                      |
|                        | - Title (A-Z / Z-A)                                                                        |
| **Date Filtering**     | Filter notes by a specific date range (`From` and `To` dates). Both fields are optional.   |
| **Reset Filters**      | Easily clear all active filters and sorting to view all notes.                             |
| **Responsive UI**      | Clean and modern design powered by Tailwind CSS.                                           |
| **Colorful Notes**     | Notes are displayed with subtle color variations for better visual organization.           |
| **Auto-Refresh**       | The notes list automatically refreshes every 30 seconds to show the latest data.           |

## 🚀 Getting Started

Follow these steps to get the Gemini Notes application up and running on your local machine.

### Prerequisites

- Python 3.8+
- `pip` (Python package installer)

### Installation

1.  **Navigate to the project directory:**

    ```bash
    cd C:\Users\PRITAM\Desktop\DOCKER\HANDS_ON\TODO
    ```

2.  \*\*Install `pipenv` (if you don't have it):

    ```bash
    pip install pipenv
    ```

3.  **Install project dependencies:**
    ```bash
    pipenv install
    ```
    This command will create a virtual environment and install all necessary packages (FastAPI, Uvicorn, etc.) as specified in `Pipfile.lock`.

### Running the Application

1.  **Start the FastAPI server:**

    ```bash
    pipenv run uvicorn main:app --host 0.0.0.0 --port 8000
    ```

    The `&` at the end runs the process in the background, allowing you to continue using your terminal.

2.  **Access the application:**
    Open your web browser and go to:
    ```
    http://localhost:8000
    ```

## 📝 Usage

- **Adding a Note:** Click the `+` button at the bottom right to open the "New Note" modal. Fill in the title, content, and optionally add checklist items.
- **Editing a Note:** Click the `Edit` button on any note card to open the "Edit Note" modal. Modify the title, content, or checklist items.
- **Deleting a Note:** Click the `Delete` button on any note card to remove it.
- **Sorting Notes:** Use the "Sort by" dropdown to arrange your notes by creation date, modification date, or title.
- **Filtering Notes:** Use the "From" and "To" date pickers to filter notes created within a specific date range.
- **Reset Filters:** Click the "Reset Filters" button to clear any active date filters and revert the sorting to default (Created Date - Newest First).

## 💾 Data Persistence

All your notes are stored in a `todos.json` file in the project's root directory. This means your data will remain even if you close and restart the application.

## 🧪 Testing with Random Data

To quickly populate your `todos.json` file with random notes for testing all features (including various timestamps and checklist configurations), you can run the provided script:

1.  **Stop the FastAPI server** (if it's running in the foreground, press `Ctrl+C`).
2.  **Run the data generation script:**
    ```bash
    pipenv run python generate_data.py
    ```
3.  **Restart the FastAPI server** to load the new data.

## 💡 Future Enhancements

- **User Authentication:** Implement user accounts to allow multiple users to manage their own notes.
- **Search Functionality:** Add a search bar to quickly find notes by keywords in their title or content.
- **Drag-and-Drop Reordering:** Allow users to reorder notes and checklist items by dragging and dropping.
- **Categories/Tags:** Implement a system for categorizing or tagging notes.
- **Notifications:** Add reminders or notifications for due dates.
- **Improved UI/UX:** Further refine the design and user experience.

## 🤖 Built with Gemini CLI

This application was developed interactively using the Gemini CLI. The process involved a series of prompts and iterative refinements to build out features and address issues. This iterative approach, guided by the CLI, significantly streamlined the development process.

**Key interactions included:**

- **Initial Setup:** Understanding the existing project structure and initial goals.
- **Feature Implementation:** Adding core functionalities like data persistence (JSON), checklist items, and UI enhancements (colorful notes, button positioning).
- **Debugging & Refinement:** Iteratively fixing bugs related to sorting, date filtering, and UI elements based on feedback.
- **New Feature Integration:** Extending existing features, such as the date filter to include "from" and "to" ranges.
- **Documentation Generation:** Creating this `README.md` file to document the project.

The development process was a collaborative effort with the Gemini CLI, guiding the implementation step-by-step.

### Prompt History

Below is a summary of the key prompts and requests made during the development of this application using the Gemini CLI:

- "continue with the todo project"
- "store data as csv format / json, and proceed with other points to"
- "add some animation in the page , like some bubbles floating slowly , auto-update of webpage not working it seems"
- "where is that bubble animation in bg , its not added , please review and add"
- "no bubbles came , F\*\*\* u" (followed by request to remove feature)
- "why have removed the UI colorful design ? revert back , add checklist kind of feature in todo"
- "filter by calendar date , and sort by features , create time , modified time should be shown for todos"
- "filter by calendar date not working properly , it's still showing all todos"
- "sort by also not working"
- "populate the data json with random data for all feature testing"
- "filter by date feature extend to from and to date kind of feature , and both can be optional , if reset , then all todos should come"
- "one UI update - the edit and delete button should be always bottom right corner of each todo"
- "looks okay, generate README with very good design, use tables if needed"
- "in readme --> end section mention how I(Pritam) used gemini cli , and prompts to generate it, how much time it took etc"
- "add summary of prompts I've given to you as record in the last section of readme"

## 🧑‍💻 Author

**Pritam Chakraborty**

- Working at TCS
- Email: pritam.tmsl@gmail.com
