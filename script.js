const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// загрузка
window.onload = function () {
  tasks.forEach(task => renderTask(task));
  input.focus(); // авто-фокус
};

// добавление
function addTask() {
  const text = input.value.trim();
  if (text === "") return;

  const task = {
    id: Date.now(),
    text: text,
    completed: false
  };

  tasks.push(task);
  saveTasks();
  renderTask(task);

  input.value = "";
  input.focus(); // возвращаем курсор
}

// рендер
function renderTask(task) {
  const li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = task.text;

  if (task.completed) {
    span.style.textDecoration = "line-through";
  }

  // выполнить
  const checkBtn = document.createElement("button");
  checkBtn.textContent = "✔️";
  checkBtn.onclick = function () {
    task.completed = !task.completed;
    saveTasks();
    span.style.textDecoration = task.completed ? "line-through" : "none";
  };

  // удалить
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.onclick = function () {
    tasks = tasks.filter(t => t.id !== task.id);
    saveTasks();
    li.remove();
  };

  li.appendChild(checkBtn);
  li.appendChild(span);
  li.appendChild(deleteBtn);

  list.appendChild(li);
}

// сохранение
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Enter
input.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});
