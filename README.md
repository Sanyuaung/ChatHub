## ✨ Features

- ⚡ <b>Real-time messaging</b> (Socket.io)
- 💬 <b>Modern, user-friendly chat UI</b>
- 📝 <b>Join with a custom name</b>
- 👥 <b>Online user count</b> & typing indicator
- 🌗 <b>Light/Dark mode toggle</b>
- 📱 <b>Fully responsive</b> (desktop & mobile)
- 🔔 <b>Notifications</b> for join/leave
- 🛑 <b>Confirmation before exit</b>
- 🧑‍🎨 <b>User avatars with initials</b>
- 🕑 <b>Scrollable message history</b>

---

## 🛠️ How It Works

<ul>
	<li>The <b>frontend</b> (Next.js) connects to the <b>backend</b> (Node.js/Express) via <b>Socket.io</b> for real-time chat.</li>
	<li>Users join by entering a name; messages are broadcast instantly to all users.</li>
	<li>The backend tracks online users and typing status.</li>
</ul>

---

## 🚀 Deployment

- <b>Frontend (Vercel):</b> <a href="https://chat-hub.sanyuaung.dev/">https://chat-hub.sanyuaung.dev/</a>
- <b>Backend (Render):</b> <a href="https://chathub-jbt2.onrender.com">https://chathub-jbt2.onrender.com</a>

---

## ⚙️ Environment Variables

<pre>
NEXT_PUBLIC_SOCKET_URL=https://chathub-jbt2.onrender.com
</pre>

---

## 🚧 Limitations

- ❌ No authentication (anyone can join with any name)
- ❌ No message persistence (messages are lost on refresh/disconnect)
- ❌ No private messaging or rooms (single global chat)
- ❌ No file/image upload
- ❌ Basic spam protection only
- ❌ Not production-hardened (demo/learning purpose)

---

## 🏁 Getting Started (Development)

```bash
# 1. Clone the repository
git clone https://github.com/sanyuaung/ChatHub.git

# 2. Set up environment variable in frontend/.env.local
NEXT_PUBLIC_SOCKET_URL=https://chathub-jbt2.onrender.com

# 3. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 4. Start backend
cd ../backend
npm run dev

# 5. Start frontend
cd ../frontend
npm run dev
```

---
