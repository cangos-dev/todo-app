const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");

window.onload = function () {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach(task => {
    createTask(task.text, task.completed);
  });
};

function addTask() {
  const text = input.value.trim();
  if (text === "") return;

  createTask(text, false);
  saveTask(text, false);

  input.value = "";
}

function createTask(text, completed) {
  const li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = text;

  if (completed) {
    span.style.textDecoration = "line-through";
  }

  // галочка
  const checkBtn = document.createElement("button");
  checkBtn.textContent = "✔️";
  checkBtn.onclick = function () {
    const isCompleted = span.style.textDecoration !== "line-through";

    span.style.textDecoration = isCompleted ? "line-through" : "none";

    updateTask(text, isCompleted);
  };

  // удаление
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = " ❌";
  deleteBtn.onclick = function () {
    li.remove();
    removeTask(text);
  };

  li.appendChild(checkBtn);
  li.appendChild(span);
  li.appendChild(deleteBtn);

  list.appendChild(li);
}

function saveTask(text, completed) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push({ text, completed });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateTask(text, completed) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  tasks = tasks.map(task => {
    if (task.text === text) {
      return { text, completed };
    }
    return task;
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function removeTask(text) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.filter(task => task.text !== text);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
