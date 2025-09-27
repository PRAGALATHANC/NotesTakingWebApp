document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const authSection = document.getElementById('authSection');
    const noteForm = document.getElementById('noteform');
    const noteContent = document.getElementById('note-content');
    const noteList = document.getElementById('notes-list');
    const logoutButton = document.getElementById('logoutButton');
    const noteSection = document.getElementById('notes-section');

    let currentUser = null;

    // Login form submit
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        login(usernameInput.value, passwordInput.value);
    });

    // Logout button click
    logoutButton.addEventListener('click', function() {
        logout();
    });

    // Note form submit
    noteForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addNote(noteContent.value);
        noteContent.value = '';
    });

    // Async login function
    async function login(username, password) {
        try {
            const response = await fetch(`http://localhost:3000/users?username=${username}&password=${password}`);
            const users = await response.json();

            if (users.length > 0) {
                currentUser = users[0];
                showNotesSection();
                loadNotes();
            } else {
                alert('Invalid credentials');
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    }

    // Logout function
    function logout() {
        currentUser = null;
        authSection.classList.remove('hidden');
        noteSection.classList.add('hidden');
    }

    // Load Notes
    async function loadNotes() {
        if (!currentUser) return;
        try {
            const response = await fetch(`http://localhost:3000/notes?userId=${currentUser.id}`);
            const notes = await response.json();
            displayNotes(notes);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    }

    // Display Notes
    function displayNotes(notes) {
        noteList.innerHTML = '';

        notes.forEach(note => {
            const li = document.createElement('li');
            const textSpan = document.createElement('span');
            textSpan.textContent = note.content;
            li.appendChild(textSpan);

            // Edit button
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', function() {
                editNotePrompt(note);
            });

            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', function() {
                deleteNote(note.id);
            });

            li.appendChild(editButton);
            li.appendChild(deleteButton);
            noteList.appendChild(li);
        });
    }

    // Add Note
    async function addNote(content) {
        if (!currentUser || content.trim() === '') return;
        try {
            await fetch('http://localhost:3000/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    content: content
                })
            });
            loadNotes();
        } catch (error) {
            console.error('Error adding note:', error);
        }
    }

    // Edit Note Prompt
    async function editNotePrompt(note) {
        const newContent = prompt('Edit your note:', note.content);
        if (newContent !== null) {
            editNote(note.id, newContent);
        }
    }

    // Edit Note
    async function editNote(id, content) {
        if (!currentUser) return;
        try {
            await fetch(`http://localhost:3000/notes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    content: content
                })
            });
            loadNotes();
        } catch (error) {
            console.error('Error editing note:', error);
        }
    }

    // Delete Note
    async function deleteNote(id) {
        if (!currentUser) return;
        try {
            await fetch(`http://localhost:3000/notes/${id}`, {
                method: 'DELETE'
            });
            loadNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    }

    // Show Notes Section
    function showNotesSection() {
        authSection.classList.add('hidden');
        noteSection.classList.remove('hidden');
    }
});
