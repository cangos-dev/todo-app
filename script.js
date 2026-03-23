function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();

  if (text === "") return;

  const li = document.createElement("li");

  // текст задачи
  const span = document.createElement("span");
  span.textContent = text;

  // кнопка удаления
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = " ❌";
  deleteBtn.onclick = function () {
    li.remove();
  };

  // собираем элемент
  li.appendChild(span);
  li.appendChild(deleteBtn);

  document.getElementById("taskList").appendChild(li);

  input.value = "";
}
