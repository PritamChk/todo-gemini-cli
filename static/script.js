document.addEventListener('DOMContentLoaded', () => {
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

    let notes = [];
    let currentNewNoteChecklist = [];
    let currentEditNoteChecklist = [];

    // Fetch existing notes from the backend
    const fetchNotes = async () => {
        const [notesResponse, countResponse] = await Promise.all([
            fetch('/todos/'),
            fetch('/todos/count')
        ]);
        notes = await notesResponse.json(); // Update the global notes array with raw data
        const countData = await countResponse.json();
        todoCountElement.textContent = `Total Todos: ${countData.count}`;
        sortAndFilterNotes(); // Then apply sorting and filtering
    };

    // Sort and filter notes
    const sortAndFilterNotes = () => {
        let currentNotes = [...notes]; // Start with a fresh copy of all notes

        // Filter by date range
        const filterDateFromValue = filterDateFromInput.value;
        const filterDateToValue = filterDateToInput.value;

        if (filterDateFromValue || filterDateToValue) {
            const fromDate = filterDateFromValue ? new Date(filterDateFromValue) : null;
            const toDate = filterDateToValue ? new Date(filterDateToValue) : null;

            currentNotes = currentNotes.filter(note => {
                const noteCreatedAt = new Date(note.created_at);
                noteCreatedAt.setHours(0, 0, 0, 0); // Normalize to start of day

                let passesFilter = true;
                if (fromDate) {
                    passesFilter = passesFilter && (noteCreatedAt >= fromDate);
                }
                if (toDate) {
                    const adjustedToDate = new Date(toDate);
                    adjustedToDate.setDate(adjustedToDate.getDate() + 1); // Include notes created on 'toDate'
                    passesFilter = passesFilter && (noteCreatedAt < adjustedToDate);
                }
                return passesFilter;
            });
        }

        // Filter by completion status
        const filterCompletionValue = filterCompletionSelect.value;
        if (filterCompletionValue === 'completed') {
            currentNotes = currentNotes.filter(note => note.completed);
        } else if (filterCompletionValue === 'incomplete') {
            currentNotes = currentNotes.filter(note => !note.completed);
        } // 'all' option means no filtering needed here

        // Sort notes
        const sortBy = sortBySelect.value;
        currentNotes.sort((a, b) => {
            if (sortBy === 'created_at_desc') {
                return new Date(b.created_at) - new Date(a.created_at);
            } else if (sortBy === 'created_at_asc') {
                return new Date(a.created_at) - new Date(b.created_at);
            } else if (sortBy === 'updated_at_desc') {
                return new Date(b.updated_at) - new Date(a.updated_at);
            } else if (sortBy === 'updated_at_asc') {
                return new Date(a.updated_at) - new Date(b.updated_at);
            } else if (sortBy === 'title_asc') {
                return a.title.localeCompare(b.title);
            } else if (sortBy === 'title_desc') {
                return b.title.localeCompare(a.title);
            } else if (sortBy === 'completed_asc') {
                return a.completed - b.completed; // false (0) comes before true (1)
            } else if (sortBy === 'completed_desc') {
                return b.completed - a.completed; // true (1) comes before false (0)
            }
            return 0;
        });

        // Update the displayed count based on filtered/sorted notes
        todoCountElement.textContent = `Displayed Todos: ${currentNotes.length}`;
        renderNotes(currentNotes);
    };

    // Render notes on the page
    const renderNotes = (notesToRender = notes) => {
        notesContainer.innerHTML = '';
        notesToRender.forEach(note => {
            const noteElement = document.createElement('div');
            const colorClass = `color-${(notesToRender.indexOf(note) % 4) + 1}`;
            noteElement.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-md', 'note-card', colorClass, 'relative', 'flex', 'flex-col', 'justify-between', 'pb-16');

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
                <div class="flex-grow mb-4"> <!-- Added mb-4 for spacing -->
                    <h2 class="text-xl font-semibold mb-2">${note.title}</h2>
                    <p class="text-gray-700 mb-2">${note.content}</p> <!-- Added mb-2 for spacing -->
                    ${checklistHtml}
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end">
                    <div>
                        <div class="text-xs text-gray-500">
                            Created: ${new Date(note.created_at).toLocaleString()}
                        </div>
                        <div class="text-xs text-gray-500 mb-2"> <!-- Added mb-2 for spacing -->
                            Modified: ${new Date(note.updated_at).toLocaleString()}
                        </div>
                        <button data-id="${note.id}" class="toggle-completed-btn px-3 py-1 rounded-md text-sm ${note.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}">
                            ${note.completed ? '✅' : 'Mark Complete'}
                        </button>
                    </div>
                    <div class="flex justify-end">
                        <button data-id="${note.id}" class="edit-btn text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                        <button data-id="${note.id}" class="delete-btn text-red-500 hover:text-red-700">Delete</button>
                    </div>
                </div>
            `;
            notesContainer.appendChild(noteElement);
        });
    };

    // Render checklist items in the new note modal
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

    // Render checklist items in the edit note modal
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

    // Show the modal for adding a new note
    addNoteBtn.addEventListener('click', () => {
        addNoteModal.classList.remove('hidden');
        noteTitleInput.value = '';
        noteContentInput.value = '';
        newChecklistItemTextInput.value = '';
        currentNewNoteChecklist = [];
        renderNewNoteChecklist();
    });

    // Close the modal
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
            const response = await fetch('/todos/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newNote),
            });

            if (response.ok) {
                notes.push(await response.json());
                fetchNotes(); // Re-fetch and re-render notes
                addNoteModal.classList.add('hidden');
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
            const response = await fetch(`/todos/${todoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedNote),
            });

            if (response.ok) {
                const updatedNoteFromServer = await response.json();
                const index = notes.findIndex(note => note.id === todoId);
                if (index !== -1) {
                    notes[index] = updatedNoteFromServer;
                    fetchNotes(); // Re-fetch and re-render notes
                }
                editNoteModal.classList.add('hidden');
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
            const response = await fetch(`/todos/${todoId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                notes = notes.filter(note => note.id !== todoId);
                fetchNotes(); // Re-fetch and re-render notes
            }
        } else if (e.target.type === 'checkbox' && e.target.dataset.noteId && e.target.dataset.itemIndex) {
            const todoId = e.target.dataset.noteId;
            const itemIndex = parseInt(e.target.dataset.itemIndex);
            const note = notes.find(n => n.id === todoId);

            if (note && note.checklist && note.checklist[itemIndex]) {
                note.checklist[itemIndex].completed = e.target.checked;

                // Update the note on the backend
                const response = await fetch(`/todos/${todoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(note),
                });

                if (response.ok) {
                    sortAndFilterNotes(); // Re-sort and filter to update UI (e.g., line-through)
                }
            }
        } else if (e.target.classList.contains('toggle-completed-btn')) {
            const todoId = e.target.dataset.id;
            const note = notes.find(n => n.id === todoId);
            if (note) {
                note.completed = !note.completed; // Toggle completion status
                const response = await fetch(`/todos/${todoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(note),
                });
                if (response.ok) {
                    fetchNotes();
                }
            }
        }
    });

    // Event listeners for sorting and filtering
    sortBySelect.addEventListener('change', sortAndFilterNotes);
    filterDateFromInput.addEventListener('change', sortAndFilterNotes);
    filterDateToInput.addEventListener('change', sortAndFilterNotes);
    filterCompletionSelect.addEventListener('change', sortAndFilterNotes);
    resetFilterBtn.addEventListener('click', () => {
        filterDateFromInput.value = ''; // Clear the from date filter
        filterDateToInput.value = ''; // Clear the to date filter
        sortBySelect.value = 'created_at_desc'; // Reset sort to default
        filterCompletionSelect.value = 'all'; // Reset completion filter to all
        fetchNotes(); // Re-fetch and re-render notes
    });

    // Initial fetch of notes
    fetchNotes();

    // Auto-refresh notes every 30 seconds
    setInterval(fetchNotes, 30000);
});