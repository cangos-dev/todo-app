function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value;

  if (text === "") return;

  const li = document.createElement("li");
  li.textContent = text;

  // Кнопка удаления
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.onclick = function () {
    li.remove();
  };

  li.appendChild(deleteBtn);
  document.getElementById("taskList").appendChild(li);

  input.value = "";
}
