let taskIdCounter = 1;

// Load tasks from localStorage
window.onload = function() {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    storedTasks.forEach(task => {
        addStoredTask(task);
    });

    // Add default tasks
    addDefaultTasks();
    updateProgress();
};

function addDefaultTasks() {
    const defaultTasks = [
        { id: 'task-default-1', text: 'Complete project report', dueDate: '2024-11-10T10:00', importance: 'urgent-important', completed: false },
        { id: 'task-default-2', text: 'Read a book on personal development', dueDate: '2024-11-15T10:00', importance: 'not-urgent-important', completed: false },
        { id: 'task-default-3', text: 'Submit application for internship', dueDate: '2024-11-20T10:00', importance: 'urgent-not-important', completed: false },
        { id: 'task-default-4', text: 'Plan a vacation', dueDate: '2024-12-01T10:00', importance: 'not-urgent-not-important', completed: false },
    ];

    defaultTasks.forEach(task => {
        addStoredTask(task);
    });
}

function addTasks() {
    const taskInput = document.getElementById("taskInput").value;
    const dueDate = document.getElementById("dueDate").value;
    const importance = document.getElementById("importance").value;

    if (!taskInput) {
        alert("Please enter a task.");
        return;
    }

    const quadrantMap = {
        "urgent-important": "tasks-urgent-important",
        "not-urgent-important": "tasks-not-urgent-important",
        "urgent-not-important": "tasks-urgent-not-important",
        "not-urgent-not-important": "tasks-not-urgent-not-important"
    };

    const newTaskId = "task-" + taskIdCounter++;
    const tasksContainer = document.getElementById(quadrantMap[importance]);

    const taskHTML = `
        <div class="task" id="${newTaskId}" draggable="true" ondragstart="event.dataTransfer.setData('text', this.id)">
            <input type="text" value="${taskInput}" onchange="updateTaskText('${newTaskId}', this.value)">
            <input type="datetime-local" value="${dueDate}" onchange="updateDueDate('due-${newTaskId}', this.value)">
            <input type="checkbox" onchange="markAsCompleted(this)">
            <button class="delete-button" onclick="deleteTask('${newTaskId}')">Delete</button>
        </div>
    `;
    tasksContainer.insertAdjacentHTML("beforeend", taskHTML);
    storeTaskInLocalStorage({ id: newTaskId, text: taskInput, dueDate: dueDate, importance: importance, completed: false });
    document.getElementById("taskInput").value = '';
    document.getElementById("dueDate").value = '';
    updateProgress();
}

function storeTaskInLocalStorage(task) {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    storedTasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(storedTasks));
}

function addStoredTask(task) {
    const quadrantMap = {
        "urgent-important": "tasks-urgent-important",
        "not-urgent-important": "tasks-not-urgent-important",
        "urgent-not-important": "tasks-urgent-not-important",
        "not-urgent-not-important": "tasks-not-urgent-not-important"
    };

    const tasksContainer = document.getElementById(quadrantMap[task.importance]);

    const taskHTML = `
        <div class="task" id="${task.id}" draggable="true" ondragstart="event.dataTransfer.setData('text', this.id)">
            <input type="text" value="${task.text}" onchange="updateTaskText('${task.id}', this.value)">
            <input type="datetime-local" value="${task.dueDate}" onchange="updateDueDate('due-${task.id}', this.value)">
            <input type="checkbox" onchange="markAsCompleted(this)" ${task.completed ? 'checked' : ''}>
            <button class="delete-button" onclick="deleteTask('${task.id}')">Delete</button>
        </div>
    `;
    tasksContainer.insertAdjacentHTML("beforeend", taskHTML);
}

function markAsCompleted(checkbox) {
    const taskElement = checkbox.parentElement;
    const taskId = taskElement.id;
    taskElement.classList.toggle('completed', checkbox.checked);
    updateProgress();

    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = storedTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        storedTasks[taskIndex].completed = checkbox.checked;
        localStorage.setItem('tasks', JSON.stringify(storedTasks));
    }
}

function updateTaskText(taskId, newText) {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = storedTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        storedTasks[taskIndex].text = newText;
        localStorage.setItem('tasks', JSON.stringify(storedTasks));
    }
}

function updateDueDate(taskId, newDate) {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = storedTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        storedTasks[taskIndex].dueDate = newDate;
        localStorage.setItem('tasks', JSON.stringify(storedTasks));
    }
}

function deleteTask(taskId) {
    const taskElement = document.getElementById(taskId);
    taskElement.parentElement.removeChild(taskElement);

    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const newStoredTasks = storedTasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(newStoredTasks));

    updateProgress();
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text");
    const taskElement = document.getElementById(taskId);
    const targetQuadrant = event.target.closest('.quadrant');
    if (targetQuadrant) {
        const quadrantId = targetQuadrant.id;
        const newImportance = getImportanceFromQuadrant(quadrantId);
        const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const taskIndex = storedTasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            storedTasks[taskIndex].importance = newImportance;
            localStorage.setItem('tasks', JSON.stringify(storedTasks));
        }
        targetQuadrant.querySelector('.tasks').appendChild(taskElement);
        updateProgress();
    }
}

function getImportanceFromQuadrant(quadrantId) {
    switch (quadrantId) {
        case "urgent-important":
            return "urgent-important";
        case "not-urgent-important":
            return "not-urgent-important";
        case "urgent-not-important":
            return "urgent-not-important";
        case "not-urgent-not-important":
            return "not-urgent-not-important";
        default:
            return "not-urgent-not-important";
    }
}

function updateProgress() {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const completedTasks = storedTasks.filter(task => task.completed).length;
    const totalTasks = storedTasks.length;

    const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
    const progressBar = document.getElementById("progressBar");
    progressBar.value = progress;
    document.getElementById("progressText").innerText = `${Math.round(progress)}%`;
}



