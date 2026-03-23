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
  if (activeBtn) activeBtn.classList.add("active-filter");

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

    li.draggable = true;
    li.dataset.id = task.id;

    // ✔️ выполнить
    const checkBtn = document.createElement("button");
    checkBtn.textContent = "✔️";
    checkBtn.onclick = () => toggleTask(task.id);

    // текст
    const span = document.createElement("span");
    span.textContent = task.text;

    if (task.completed) {
      span.classList.add("completed");
    }

    span.ondblclick = () => editTask(task.id);

    // ❌ удалить
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

//
// 🔥 TREllo-уровень DRAG & DROP
//
function enableDragAndDrop() {
  let dragged = null;

  list.querySelectorAll("li").forEach(item => {

    item.addEventListener("dragstart", () => {
      dragged = item;
      item.classList.add("dragging");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      dragged = null;

      // сохраняем новый порядок
      const newOrder = [...list.querySelectorAll("li")].map(li => {
        return tasks.find(t => t.id == li.dataset.id);
      });

      tasks = newOrder;
      saveTasks();
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();

      const afterElement = getDragAfterElement(list, e.clientY);

      if (afterElement == null) {
        list.appendChild(dragged);
      } else {
        list.insertBefore(dragged, afterElement);
      }
    });
  });
}

// определяем куда вставлять элемент
function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll("li:not(.dragging)")];

  return elements.reduce((closest, child) => {
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
