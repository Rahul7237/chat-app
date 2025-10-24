// Replace with your deployed server URL
const SERVER_URL = "https://your-socket-server-url.com"; 
const socket = io(SERVER_URL);

let currentUser = '';
let currentChatUser = '';
let chatHistory = {}; // store messages for each user

const loginContainer = document.getElementById('loginContainer');
const chatContainer = document.getElementById('chatContainer');
const usernameInput = document.getElementById('usernameInput');
const loginBtn = document.getElementById('loginBtn');
const greeting = document.getElementById('greeting');
const usersList = document.getElementById('usersList');
const chatHeader = document.getElementById('chatHeader');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// ----- Login -----
loginBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (!username) {
    console.log("Login failed: Username empty");
    return;
  }
  currentUser = username;
  console.log(`Logging in as: ${currentUser}`);
  socket.emit('setUsername', username);
  greeting.innerText = `Hi, ${username}`;
  loginContainer.style.display = 'none';
  chatContainer.style.display = 'flex';
});

// ----- Update online users -----
socket.on('onlineUsers', (users) => {
  console.log('Online users updated:', users);
  usersList.innerHTML = '';
  users.filter(u => u !== currentUser).forEach(u => {
    const div = document.createElement('div');
    div.innerText = u;
    div.classList.toggle('active', currentChatUser === u);
    div.addEventListener('click', () => {
      currentChatUser = u;
      chatHeader.innerText = `Chat with ${u}`;
      console.log(`Opened chat with: ${u}`);
      document.querySelectorAll('.sidebar div').forEach(d => d.classList.remove('active'));
      div.classList.add('active');
      renderChat(u);
    });
    usersList.appendChild(div);
  });
});

// ----- Send message -----
sendBtn.addEventListener('click', () => {
  const msg = messageInput.value.trim();
  if (!msg || !currentChatUser) {
    console.log('Message not sent: Either message empty or no user selected');
    return;
  }
  console.log(`Sending message to ${currentChatUser}: ${msg}`);
  storeMessage(currentChatUser, { sender: currentUser, text: msg, type: 'sent' });
  addMessage(msg, 'sent');
  socket.emit('privateMessage', { to: currentChatUser, message: msg });
  messageInput.value = '';
});

// ----- Receive message -----
socket.on('receiveMessage', ({ from, message }) => {
  console.log(`Received message from ${from}: ${message}`);
  storeMessage(from, { sender: from, text: message, type: 'received' });
  if (from === currentChatUser) {
    addMessage(message, 'received');
  }
});

// ----- Helper: Render chat history for selected user -----
function renderChat(user) {
  messagesDiv.innerHTML = '';
  const history = chatHistory[user] || [];
  history.forEach(msg => addMessage(msg.text, msg.type));
}

// ----- Helper: Store messages per user -----
function storeMessage(user, msg) {
  if (!chatHistory[user]) chatHistory[user] = [];
  chatHistory[user].push(msg);
}

// ----- Helper: Add message to chat -----
function addMessage(text, type) {
  const div = document.createElement('div');
  div.classList.add(type);
  div.innerText = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  console.log(`Message added to chat: [${type}] ${text}`);
}

// ----- Debug: Socket connection -----
socket.on('connect', () => console.log('Socket connected, id:', socket.id));
socket.on('disconnect', () => console.log('Socket disconnected'));
socket.on('connect_error', (err) => console.log('Connection error:', err));
