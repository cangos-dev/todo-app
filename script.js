const input = document.getElementById("taskInput");
const searchInput = document.getElementById("searchInput");
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
    }, 250);
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
  const newText = prompt("Редактировать:", task.text);

  if (newText && newText.trim()) {
    task.text = newText.trim();
    saveTasks();
    renderTasks();
  }
}

// очистка выполненных
function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
}

// фильтр
function setFilter(filter) {
  currentFilter = filter;

  document.querySelectorAll(".controls button")
    .forEach(btn => btn.classList.remove("active-filter"));

  const activeBtn = document.getElementById(`filter-${filter}`);
  if (activeBtn) activeBtn.classList.add("active-filter");

  renderTasks();
}

// фильтрация + поиск
function getFilteredTasks() {
  let filtered = tasks;

  if (currentFilter === "active") {
    filtered = filtered.filter(t => !t.completed);
  }

  if (currentFilter === "completed") {
    filtered = filtered.filter(t => t.completed);
  }

  const search = searchInput.value.toLowerCase();

  if (search) {
    filtered = filtered.filter(t =>
      t.text.toLowerCase().includes(search)
    );
  }

  return filtered;
}

// рендер
function renderTasks() {
  list.innerHTML = "";

  getFilteredTasks().forEach(task => {
    const li = document.createElement("li");

    li.dataset.id = task.id;
    li.draggable = true;

    const checkBtn = document.createElement("button");
    checkBtn.textContent = "✔️";
    checkBtn.onclick = () => toggleTask(task.id);

    const span = document.createElement("span");
    span.textContent = task.text;

    if (task.completed) {
      li.classList.add("completed");
    }

    span.ondblclick = () => editTask(task.id);

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

// drag & drop (как Trello)
function enableDragAndDrop() {
  let dragged = null;

  list.querySelectorAll("li").forEach(item => {

    item.addEventListener("dragstart", () => {
      dragged = item;
      item.style.opacity = "0.5";
    });

    item.addEventListener("dragend", () => {
      item.style.opacity = "1";

      // сохраняем порядок
      const newOrder = [...list.querySelectorAll("li")].map(li =>
        tasks.find(t => t.id == li.dataset.id)
      );

      tasks = newOrder;
      saveTasks();
    });

    item.addEventListener("dragover", e => {
      e.preventDefault();
      const after = getDragAfterElement(list, e.clientY);

      if (after == null) {
        list.appendChild(dragged);
      } else {
        list.insertBefore(dragged, after);
      }
    });
  });
}

function getDragAfterElement(container, y) {
  const items = [...container.querySelectorAll("li:not([style*='opacity'])")];

  return items.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Enter
input.addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});

// поиск
searchInput.addEventListener("input", renderTasks);
