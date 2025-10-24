const socket = io();

let currentUser = '';
let currentChatUser = '';

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

loginBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (!username) return;
  currentUser = username;
  socket.emit('setUsername', username);
  greeting.innerText = `Hi, ${username}`;
  loginContainer.style.display = 'none';
  chatContainer.style.display = 'flex';
});

socket.on('onlineUsers', (users) => {
  usersList.innerHTML = '';
  users.filter(u => u !== currentUser).forEach(u => {
    const div = document.createElement('div');
    div.innerText = u;
    div.classList.toggle('active', currentChatUser === u);
    div.addEventListener('click', () => {
      currentChatUser = u;
      chatHeader.innerText = `Chat with ${u}`;
      document.querySelectorAll('.sidebar div').forEach(d => d.classList.remove('active'));
      div.classList.add('active');
      messagesDiv.innerHTML = ''; // clear chat
    });
    usersList.appendChild(div);
  });
});

sendBtn.addEventListener('click', () => {
  const msg = messageInput.value.trim();
  if (!msg || !currentChatUser) return;
  addMessage(currentUser, msg, 'sent');
  socket.emit('privateMessage', { to: currentChatUser, message: msg });
  messageInput.value = '';
});

socket.on('receiveMessage', ({ from, message }) => {
  if (from === currentChatUser) {
    addMessage(from, message, 'received');
  }
});

function addMessage(sender, text, type) {
  const div = document.createElement('div');
  div.classList.add(type);
  div.innerText = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
