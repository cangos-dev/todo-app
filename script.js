const input = document.getElementById("taskInput");
const searchInput = document.getElementById("searchInput");
const list = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

// Undo / Redo
let history = [];
let future = [];

// загрузка
window.onload = () => {
  setFilter("all");
  input.focus();

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
};

// сохранить
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// история (без дублей)
function pushHistory() {
  const current = JSON.stringify(tasks);
  const last = history[history.length - 1];

  if (last !== current) {
    history.push(current);
    future = [];
  }
}

// восстановление
function restoreState(state) {
  tasks = JSON.parse(state);
  saveTasks();
  renderTasks();
}

// undo / redo
function undo() {
  if (!history.length) return;

  future.push(JSON.stringify(tasks));
  restoreState(history.pop());
}

function redo() {
  if (!future.length) return;

  history.push(JSON.stringify(tasks));
  restoreState(future.pop());
}

// добавить задачу
function addTask() {
  const text = input.value.trim();
  if (!text) return;

  const dueDate = prompt("Дедлайн (YYYY-MM-DD, можно пусто):");

  // 🏷 теги
  const tags = (text.match(/#\w+/g) || []).map(t => t.replace("#", ""));

  pushHistory();

  tasks.push({
    id: Date.now(),
    text: text.replace(/#\w+/g, "").trim(),
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: dueDate || null,
    tags
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
      pushHistory();

      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      renderTasks();
    }, 250);
  }
}

// выполнить
function toggleTask(id) {
  pushHistory();

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
    pushHistory();
    task.text = newText.trim();
    saveTasks();
    renderTasks();
  }
}

// очистка выполненных
function clearCompleted() {
  pushHistory();

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

// 📊 статистика
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const overdue = tasks.filter(t =>
    t.dueDate &&
    new Date(t.dueDate) < new Date() &&
    !t.completed
  ).length;

  const percent = total ? Math.round((completed / total) * 100) : 0;

  const el = document.getElementById("stats");
  if (el) {
    el.textContent =
      `Всего: ${total} | Выполнено: ${completed} (${percent}%) | Просрочено: ${overdue}`;
  }
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
    span.ondblclick = () => editTask(task.id);

    if (task.completed) li.classList.add("completed");

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.onclick = () => deleteTask(task.id);

    // 📅 дата
    const date = document.createElement("small");

    if (task.dueDate) {
      date.textContent = "⏳ " + task.dueDate;

      const now = new Date();
      const due = new Date(task.dueDate);

      if (!task.completed) {
        const diff = due - now;

        if (diff < 0) {
          li.style.borderLeft = "4px solid red";
        } else if (diff < 86400000) {
          li.style.borderLeft = "4px solid orange";
        }
      }
    } else {
      date.textContent = "📅 " + new Date(task.createdAt).toLocaleDateString();
    }

    date.style.opacity = "0.6";

    // 🏷 теги
    if (task.tags && task.tags.length) {
      task.tags.forEach(tag => {
        const tagEl = document.createElement("small");
        tagEl.textContent = "#" + tag;

        tagEl.style.marginLeft = "5px";
        tagEl.style.background = "#555";
        tagEl.style.color = "white";
        tagEl.style.padding = "2px 5px";
        tagEl.style.borderRadius = "5px";
        tagEl.style.fontSize = "10px";

        li.appendChild(tagEl);
      });
    }

    li.append(checkBtn, span, date, deleteBtn);
    list.appendChild(li);
  });

  updateStats();
  enableDragAndDrop();
}

// drag & drop
function enableDragAndDrop() {
  let dragged = null;

  list.querySelectorAll("li").forEach(item => {

    item.addEventListener("dragstart", () => {
      dragged = item;
      item.style.opacity = "0.5";
    });

    item.addEventListener("dragend", () => {
      item.style.opacity = "1";

      pushHistory();

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
  const items = [...container.querySelectorAll("li")];

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

// тема
function toggleTheme() {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

// клавиши
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "z") {
    e.preventDefault();
    undo();
  }

  if (e.ctrlKey && e.key === "y") {
    e.preventDefault();
    redo();
  }
});

// Enter
input.addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});

// поиск
searchInput.addEventListener("input", renderTasks);
