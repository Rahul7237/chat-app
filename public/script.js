const socket = io();
let username = null;
let selectedUser = null;
let chatHistory = {};

// Login only on button click
function login() {
  const input = document.getElementById("usernameInput");
  const name = input.value.trim();

  if (!name) {
    alert("Please enter your name");
    return;
  }

  username = name;

  // emit username only after login
  socket.emit("setUsername", username);

  // hide login screen and show chat
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("chatScreen").style.display = "flex";

  // Show greeting on sidebar
  document.getElementById("userGreeting").innerText = "Hi, " + username;
}

// Update online users dynamically
socket.on("onlineUsers", (users) => {
  const list = document.getElementById("onlineUsers");
  list.innerHTML = "";

  users.forEach(user => {
    if (user !== username) {
      const div = document.createElement("div");
      div.textContent = user;
      div.onclick = () => selectUser(user, div);
      list.appendChild(div);

      if (!chatHistory[user]) chatHistory[user] = [];
    }
  });
});

// Select user
function selectUser(user, divElement) {
  selectedUser = user;
  document.getElementById("chatHeader").innerText = "Chat with " + user;

  // highlight active user
  document.querySelectorAll('.sidebar div').forEach(d => d.classList.remove('active'));
  divElement.classList.add('active');

  renderMessages(user);
}

// Send message
function sendMessage() {
  if (!selectedUser) return;

  const msgInput = document.getElementById("messageInput");
  const msg = msgInput.value.trim();
  if (!msg) return;

  chatHistory[selectedUser].push({ message: msg, type: "sent" });
  renderMessages(selectedUser);

  socket.emit("privateMessage", { to: selectedUser, message: msg });
  msgInput.value = "";
}

// Receive message
socket.on("receiveMessage", ({ from, message }) => {
  if (!chatHistory[from]) chatHistory[from] = [];
  chatHistory[from].push({ message, type: "received" });

  if (selectedUser === from) renderMessages(from);
});

// Render messages
function renderMessages(user) {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";
  chatHistory[user].forEach(msg => {
    const div = document.createElement("div");
    div.classList.add(msg.type);
    div.textContent = msg.type === "sent" ? "You: " + msg.message : user + ": " + msg.message;
    messagesDiv.appendChild(div);
  });
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
