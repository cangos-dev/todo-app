function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value;

  if (text === "") return;

  const li = document.createElement("li");
  li.textContent = text;

  document.getElementById("taskList").appendChild(li);

  input.value = "";
}
