const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

// загрузка
window.onload = () => {
  renderTasks();
  input.focus();
};

// сохранить
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// добавить
function addTask() {
  const text = input.value.trim();
  if (!text) return;

  tasks.push({
    id: Date.now(),
    text,
    completed: false
  });

  saveTasks();
  renderTasks();

  input.value = "";
  input.focus();
}

// удалить
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// выполнить
function toggleTask(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTasks();
  renderTasks();
}

// редактировать
function editTask(id) {
  const task = tasks.find(t => t.id === id);

  const newText = prompt("Редактировать задачу:", task.text);

  if (newText && newText.trim()) {
    task.text = newText.trim();
    saveTasks();
    renderTasks();
  }
}

// фильтр
function setFilter(filter) {
  currentFilter = filter;
  renderTasks();
}

// получить задачи
function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter(t => !t.completed);
  }
  if (currentFilter === "completed") {
    return tasks.filter(t => t.completed);
  }
  return tasks;
}

// рендер
function renderTasks() {
  list.innerHTML = "";

  getFilteredTasks().forEach(task => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = task.text;

    if (task.completed) {
      span.classList.add("completed");
    }

    // выполнить
    span.onclick = () => toggleTask(task.id);

    // редактировать (двойной клик)
    span.ondblclick = () => editTask(task.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.onclick = () => deleteTask(task.id);

    li.appendChild(span);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

// Enter
input.addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});
