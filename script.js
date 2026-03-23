const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

// загрузка
window.onload = () => {
  setFilter("all");
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
  const li = document.querySelector(`li[data-id="${id}"]`);

  if (li) {
    li.classList.add("removing");

    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      renderTasks();
    }, 300);
  }
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

  document.querySelectorAll(".controls button")
    .forEach(btn => btn.classList.remove("active-filter"));

  const activeBtn = document.getElementById(`filter-${filter}`);
  if (activeBtn) {
    activeBtn.classList.add("active-filter");
  }

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

    li.setAttribute("draggable", true);
    li.dataset.id = task.id;

    // ✔️ кнопка выполнить
    const checkBtn = document.createElement("button");
    checkBtn.textContent = "✔️";
    checkBtn.onclick = () => toggleTask(task.id);

    // текст задачи
    const span = document.createElement("span");
    span.textContent = task.text;

    if (task.completed) {
      span.classList.add("completed");
    }

    // редактирование
    span.ondblclick = () => editTask(task.id);

    // ❌ кнопка удалить
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.onclick = () => deleteTask(task.id);

    li.appendChild(checkBtn);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });

  enableDragAndDrop();
}

// drag & drop
function enableDragAndDrop() {
  let draggedItem = null;

  const items = document.querySelectorAll("li");

  items.forEach(item => {

    item.addEventListener("dragstart", () => {
      draggedItem = item;
      item.style.opacity = "0.5";
    });

    item.addEventListener("dragend", () => {
      draggedItem = null;
      item.style.opacity = "1";
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    item.addEventListener("drop", (e) => {
      e.preventDefault();

      if (!draggedItem || draggedItem === item) return;

      const draggedId = Number(draggedItem.dataset.id);
      const targetId = Number(item.dataset.id);

      const draggedIndex = tasks.findIndex(t => t.id === draggedId);
      const targetIndex = tasks.findIndex(t => t.id === targetId);

      const [removed] = tasks.splice(draggedIndex, 1);
      tasks.splice(targetIndex, 0, removed);

      saveTasks();
      renderTasks();
    });
  });
}

// Enter
input.addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});
