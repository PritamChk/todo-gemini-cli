document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const notesContainer = document.getElementById('notes-container');
    const addNoteBtn = document.getElementById('add-note-btn');
    const addNoteModal = document.getElementById('add-note-modal');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const newChecklistItemTextInput = document.getElementById('new-checklist-item-text');
    const addChecklistItemBtn = document.getElementById('add-checklist-item-btn');
    const newNoteChecklistItemsContainer = document.getElementById('new-note-checklist-items');

    const editNoteModal = document.getElementById('edit-note-modal');
    const updateNoteBtn = document.getElementById('update-note-btn');
    const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
    const editNoteIdInput = document.getElementById('edit-note-id');
    const editNoteTitleInput = document.getElementById('edit-note-title');
    const editNoteContentInput = document.getElementById('edit-note-content');
    const editChecklistItemTextInput = document.getElementById('edit-checklist-item-text');
    const editAddChecklistItemBtn = document.getElementById('edit-add-checklist-item-btn');
    const editNoteChecklistItemsContainer = document.getElementById('edit-note-checklist-items');

    const sortBySelect = document.getElementById('sort-by');
    const filterDateFromInput = document.getElementById('filter-date-from');
    const filterDateToInput = document.getElementById('filter-date-to');
    const resetFilterBtn = document.getElementById('reset-filter-btn');
    const todoCountElement = document.getElementById('todo-count');
    const filterCompletionSelect = document.getElementById('filter-completion');

    // Pagination elements
    const itemsPerPageSelect = document.getElementById('items-per-page');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const pageNumbersSpan = document.getElementById('page-numbers');

    // --- Global State Variables ---
    let notes = []; // Holds the currently displayed (paginated, filtered, sorted) notes
    let currentPage = 1;
    let itemsPerPage = 10; // Default items per page
    let totalPages = 1;
    let totalTodos = 0; // Total count of todos (unfiltered)

    let currentNewNoteChecklist = [];
    let currentEditNoteChecklist = [];

    // --- Core Functions --- 

    // Fetches notes from the backend with current filter, sort, and pagination parameters
    const fetchNotes = async () => {
        const sortBy = sortBySelect.value;
        const filterDateFromValue = filterDateFromInput.value;
        const filterDateToValue = filterDateToInput.value;
        const filterCompletionValue = filterCompletionSelect.value;

        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: itemsPerPage,
            sort_by: sortBy,
        });

        if (filterDateFromValue) {
            queryParams.append('filter_date_from', filterDateFromValue);
        }
        if (filterDateToValue) {
            queryParams.append('filter_date_to', filterDateToValue);
        }
        if (filterCompletionValue !== 'all') {
            queryParams.append('filter_completion', filterCompletionValue);
        }

        try {
            const response = await fetch(`/todos/?${queryParams.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            notes = data.todos; // Update global notes with the fetched data
            totalPages = data.total_pages;
            currentPage = data.current_page;
            totalTodos = data.total_todos; // Update total todos count

            todoCountElement.textContent = `Total Todos: ${totalTodos}`;
            renderNotes(notes); // Render the fetched notes
            updatePaginationControls(); // Update pagination UI
        } catch (error) {
            console.error("Error fetching todos:", error);
            notesContainer.innerHTML = '<p class="text-center text-red-500">Error loading todos. Please try again.</p>';
        }
    };

    // Renders notes on the page
    const renderNotes = (notesToRender) => {
        notesContainer.innerHTML = '';
        if (notesToRender.length === 0 && totalTodos === 0) {
            notesContainer.innerHTML = '<p class="text-center text-gray-500">No todos created yet. Add one!</p>';
            return;
        }
        if (notesToRender.length === 0 && totalTodos > 0) {
            notesContainer.innerHTML = '<p class="text-center text-gray-500">No todos match your current filters.</p>';
            return;
        }

        notesToRender.forEach(note => {
            const noteElement = document.createElement('div');
            // Assign color class based on index for visual variety
            const colorClass = `color-${(notesToRender.indexOf(note) % 4) + 1}`;
            noteElement.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-md', 'note-card', colorClass, 'relative', 'flex', 'flex-col', 'justify-between', 'pb-16'); // pb-16 for button space

            let checklistHtml = '';
            if (note.checklist && note.checklist.length > 0) {
                checklistHtml = '<ul class="mt-2 space-y-1">';
                note.checklist.forEach((item, itemIndex) => {
                    checklistHtml += `
                        <li class="flex items-center">
                            <input type="checkbox" data-note-id="${note.id}" data-item-index="${itemIndex}" ${item.completed ? 'checked' : ''} class="form-checkbox h-4 w-4 text-blue-600 rounded">
                            <span class="ml-2 text-gray-700 ${item.completed ? 'line-through text-gray-500' : ''}">${item.text}</span>
                        </li>
                    `;
                });
                checklistHtml += '</ul>';
            }

            noteElement.innerHTML = `
                <div class="flex-grow mb-4">
                    <h2 class="text-xl font-semibold mb-2">${note.title}</h2>
                    <p class="text-gray-700 mb-2">${note.content}</p>
                    ${checklistHtml}
                    <div class="text-xs text-gray-500 mt-2">
                        Created: ${new Date(note.created_at).toLocaleString()}
                    </div>
                    <div class="text-xs text-gray-500 mb-2">
                        Modified: ${new Date(note.updated_at).toLocaleString()}
                    </div>
                </div>
                <div class="absolute bottom-0 left-0 p-4">
                    <button data-id="${note.id}" class="toggle-completed-btn px-3 py-1 rounded-md text-sm ${note.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}">
                        ${note.completed ? '✅' : 'Mark Complete'}
                    </button>
                </div>
                <div class="absolute bottom-0 right-0 flex justify-end p-4">
                    <button data-id="${note.id}" class="edit-btn text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                    <button data-id="${note.id}" class="delete-btn text-red-500 hover:text-red-700">Delete</button>
                </div>
            `;
            notesContainer.appendChild(noteElement);
        });
    };

    // Updates pagination controls UI
    const updatePaginationControls = () => {
        pageNumbersSpan.textContent = `Page ${currentPage} of ${totalPages}`;

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    };

    // --- Event Handlers --- 

    // Show the modal for adding a new note
    addNoteBtn.addEventListener('click', () => {
        addNoteModal.classList.remove('hidden');
        noteTitleInput.value = '';
        noteContentInput.value = '';
        newChecklistItemTextInput.value = '';
        currentNewNoteChecklist = [];
        renderNewNoteChecklist();
    });

    // Close the add note modal
    closeModalBtn.addEventListener('click', () => {
        addNoteModal.classList.add('hidden');
    });

    // Add checklist item for new note
    addChecklistItemBtn.addEventListener('click', () => {
        const itemText = newChecklistItemTextInput.value.trim();
        if (itemText) {
            currentNewNoteChecklist.push({ text: itemText, completed: false });
            newChecklistItemTextInput.value = '';
            renderNewNoteChecklist();
        }
    });

    // Remove checklist item for new note
    newNoteChecklistItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-new-checklist-item-btn')) {
            const index = parseInt(e.target.dataset.index);
            currentNewNoteChecklist.splice(index, 1);
            renderNewNoteChecklist();
        }
    });

    // Save a new note
    saveNoteBtn.addEventListener('click', async () => {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();

        if (title && content) {
            const newNote = { title, content, checklist: currentNewNoteChecklist };
            try {
                const response = await fetch('/todos/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newNote),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                await response.json(); // Consume response
                addNoteModal.classList.add('hidden');
                fetchNotes(); // Re-fetch and re-render notes
            } catch (error) {
                console.error("Error saving new note:", error);
                alert("Failed to save note. Please try again.");
            }
        }
    });

    // Close the edit modal
    closeEditModalBtn.addEventListener('click', () => {
        editNoteModal.classList.add('hidden');
    });

    // Add checklist item for edit note
    editAddChecklistItemBtn.addEventListener('click', () => {
        const itemText = editChecklistItemTextInput.value.trim();
        if (itemText) {
            currentEditNoteChecklist.push({ text: itemText, completed: false });
            editChecklistItemTextInput.value = '';
            renderEditNoteChecklist();
        }
    });

    // Remove checklist item for edit note
    editNoteChecklistItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-edit-checklist-item-btn')) {
            const index = parseInt(e.target.dataset.index);
            currentEditNoteChecklist.splice(index, 1);
            renderEditNoteChecklist();
        }
    });

    // Update a note
    updateNoteBtn.addEventListener('click', async () => {
        const todoId = editNoteIdInput.value;
        const title = editNoteTitleInput.value.trim();
        const content = editNoteContentInput.value.trim();

        if (title && content) {
            const updatedNote = { title, content, checklist: currentEditNoteChecklist };
            try {
                const response = await fetch(`/todos/${todoId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedNote),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                await response.json(); // Consume response
                editNoteModal.classList.add('hidden');
                fetchNotes(); // Re-fetch and re-render notes
            } catch (error) {
                console.error("Error updating note:", error);
                alert("Failed to update note. Please try again.");
            }
        }
    });

    // Handle clicks on edit and delete buttons and checklist checkboxes
    notesContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const todoId = e.target.dataset.id;
            const note = notes.find(note => note.id === todoId);
            if (note) {
                editNoteIdInput.value = note.id;
                editNoteTitleInput.value = note.title;
                editNoteContentInput.value = note.content;
                currentEditNoteChecklist = JSON.parse(JSON.stringify(note.checklist || [])); // Deep copy
                renderEditNoteChecklist();
                editNoteModal.classList.remove('hidden');
            }
        } else if (e.target.classList.contains('delete-btn')) {
            const todoId = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this todo?')) {
                try {
                    const response = await fetch(`/todos/${todoId}`, {
                        method: 'DELETE',
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    fetchNotes(); // Re-fetch and re-render notes
                } catch (error) {
                    console.error("Error deleting note:", error);
                    alert("Failed to delete note. Please try again.");
                }
            }
        } else if (e.target.type === 'checkbox' && e.target.dataset.noteId && e.target.dataset.itemIndex) {
            const todoId = e.target.dataset.noteId;
            const itemIndex = parseInt(e.target.dataset.itemIndex);
            const note = notes.find(n => n.id === todoId);

            if (note && note.checklist && note.checklist[itemIndex]) {
                note.checklist[itemIndex].completed = e.target.checked;
                try {
                    const response = await fetch(`/todos/${todoId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(note),
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    fetchNotes(); // Re-fetch and re-render notes
                } catch (error) {
                    console.error("Error updating checklist item:", error);
                    alert("Failed to update checklist item. Please try again.");
                }
            }
        } else if (e.target.classList.contains('toggle-completed-btn')) {
            const todoId = e.target.dataset.id;
            const note = notes.find(n => n.id === todoId);
            if (note) {
                note.completed = !note.completed; // Toggle completion status
                try {
                    const response = await fetch(`/todos/${todoId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(note),
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    fetchNotes(); // Re-fetch and re-render notes
                } catch (error) {
                    console.error("Error toggling completion status:", error);
                    alert("Failed to toggle completion status. Please try again.");
                }
            }
        }
    });

    // --- Filter, Sort, and Pagination Event Listeners --- 

    sortBySelect.addEventListener('change', () => {
        currentPage = 1; // Reset to first page on sort change
        fetchNotes();
    });
    filterDateFromInput.addEventListener('change', () => {
        currentPage = 1; // Reset to first page on filter change
        fetchNotes();
    });
    filterDateToInput.addEventListener('change', () => {
        currentPage = 1; // Reset to first page on filter change
        fetchNotes();
    });
    filterCompletionSelect.addEventListener('change', () => {
        currentPage = 1; // Reset to first page on filter change
        fetchNotes();
    });

    resetFilterBtn.addEventListener('click', () => {
        filterDateFromInput.value = '';
        filterDateToInput.value = '';
        sortBySelect.value = 'created_at_desc';
        filterCompletionSelect.value = 'all';
        currentPage = 1;
        itemsPerPageSelect.value = '10'; // Reset items per page to default
        itemsPerPage = 10;
        fetchNotes();
    });

    itemsPerPageSelect.addEventListener('change', () => {
        itemsPerPage = parseInt(itemsPerPageSelect.value);
        currentPage = 1; // Reset to first page when items per page changes
        fetchNotes();
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchNotes();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchNotes();
        }
    });

    // --- Initial Load and Auto-Refresh --- 
    fetchNotes(); // Initial fetch of notes

    setInterval(fetchNotes, 30000); // Auto-refresh notes every 30 seconds

    // --- Helper Functions for Modals (Checklist Rendering) --- 
    const renderNewNoteChecklist = () => {
        newNoteChecklistItemsContainer.innerHTML = '';
        currentNewNoteChecklist.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('flex', 'justify-between', 'items-center', 'py-1');
            itemElement.innerHTML = `
                <span>${item.text}</span>
                <button data-index="${index}" class="remove-new-checklist-item-btn text-red-500 hover:text-red-700">Remove</button>
            `;
            newNoteChecklistItemsContainer.appendChild(itemElement);
        });
    };

    const renderEditNoteChecklist = () => {
        editNoteChecklistItemsContainer.innerHTML = '';
        currentEditNoteChecklist.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('flex', 'justify-between', 'items-center', 'py-1');
            itemElement.innerHTML = `
                <span>${item.text}</span>
                <button data-index="${index}" class="remove-edit-checklist-item-btn text-red-500 hover:text-red-700">Remove</button>
            `;
            editNoteChecklistItemsContainer.appendChild(itemElement);
        });
    };
});