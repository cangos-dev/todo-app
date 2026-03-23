const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");

// загрузка задач
window.onload = function () {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach(task => {
    createTask(task);
  });
};

// добавление задачи
function addTask() {
  const text = input.value.trim();
  if (text === "") return;

  createTask(text);
  saveTask(text);

  input.value = "";
}

// создание элемента
function createTask(text) {
  const li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = text;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = " ❌";

  deleteBtn.onclick = function () {
    li.remove();
    removeTask(text);
  };

  li.appendChild(span);
  li.appendChild(deleteBtn);

  list.appendChild(li);
}

// сохранить
function saveTask(text) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(text);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// удалить
function removeTask(text) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.filter(t => t !== text);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
