let currentPage = 1;
const tasksPerPage = 5;
let allTasks = [];

document.addEventListener('DOMContentLoaded', fetchTasks);
document.getElementById('task-form').addEventListener('submit', addTask);
document.getElementById('filter-form').addEventListener('submit', filterTasks);

async function fetchTasks() {
  try {
    const response = await fetch('http://localhost:3000/tasks');
    if (!response.ok) throw new Error('Network response was not ok');
    allTasks = await response.json();
    displayTasks(paginate(allTasks));
    displayPagination(allTasks.length);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

function displayTasks(tasks) {
  const taskContainer = document.getElementById('task-container');
  taskContainer.innerHTML = '';
  tasks.forEach(task => {
    const priority = getPriority(task.dueDate);
    const taskCard = document.createElement('div');
    taskCard.className = `task-card ${priority.toLowerCase()}`;
    taskCard.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description}</p>
      <p>Status: ${task.status}</p>
      <p>Due Date: ${new Date(task.dueDate).toLocaleString()}</p>
      <p>Priority: ${priority}</p>
      <button onclick="editTask(${task.id})">Edit</button>
      <button onclick="deleteTask(${task.id})">Delete</button>
    `;
    taskContainer.appendChild(taskCard);
  });
}

function getPriority(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = (due - now) / 1000 / 60; // difference in minutes
  if (diff <= 2) return 'High';
  if (diff <= 3) return 'Medium';
  return 'Low';
}

function paginate(tasks) {
  const start = (currentPage - 1) * tasksPerPage;
  const end = start + tasksPerPage;
  return tasks.slice(start, end);
}

function displayPagination(totalTasks) {
  const totalPages = Math.ceil(totalTasks / tasksPerPage);
  const paginationContainer = document.getElementById('pagination-container');
  paginationContainer.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.innerText = i;
    button.onclick = () => {
      currentPage = i;
      displayTasks(paginate(allTasks));
    };
    paginationContainer.appendChild(button);
  }
}

async function addTask(event) {
  event.preventDefault();
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const dueDate = document.getElementById('dueDate').value;
  const status = document.getElementById('status').value;
  const newTask = { title, description, dueDate, status };
  try {
    const response = await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    });
    if (!response.ok) throw new Error('Network response was not ok');
    fetchTasks();
  } catch (error) {
    console.error('Create error:', error);
  }
}

async function editTask(id) {
  const task = allTasks.find(task => task.id === id);
  if (!task) return;

  document.getElementById('title').value = task.title;
  document.getElementById('description').value = task.description;
  document.getElementById('dueDate').value = task.dueDate;
  document.getElementById('status').value = task.status;

  document.getElementById('task-form').onsubmit = async (event) => {
    event.preventDefault();
    const updatedTask = {
      id,
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      dueDate: document.getElementById('dueDate').value,
      status: document.getElementById('status').value
    };
    try {
      const response = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      if (!response.ok) throw new Error('Network response was not ok');
      document.getElementById('task-form').reset();
      document.getElementById('task-form').onsubmit = addTask;
      fetchTasks();
    } catch (error) {
      console.error('Update error:', error);
    }
  };
}

async function deleteTask(id) {
  try {
    const response = await fetch(`http://localhost:3000/tasks/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Network response was not ok');
    fetchTasks();
  } catch (error) {
    console.error('Delete error:', error);
  }
}

function filterTasks(event) {
  event.preventDefault();
  const status = document.getElementById('filter-status').value;
  const priority = document.getElementById('filter-priority').value;

  const filteredTasks = allTasks.filter(task => {
    const taskPriority = getPriority(task.dueDate);
    return (status === '' || task.status === status) && (priority === '' || taskPriority === priority);
  });

  displayTasks(paginate(filteredTasks));
  displayPagination(filteredTasks.length);
}
