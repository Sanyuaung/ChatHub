# 🚀 Web Socket From Scratch

<!-- <p align="center">
	<img src="./preview.png" alt="Chat App Preview" width="600" style="border-radius: 12px; box-shadow: 0 4px 24px #0002; margin-bottom: 16px;" />
</p> -->

<p align="center">
	<b>Modern real-time chat app built with Next.js, Mantine, and Socket.io</b>
</p>

---

## ✨ Features

- Real-time chat using Socket.io (Node.js backend in `server.js`)
- Beautiful UI with Mantine (custom theme, light/dark mode)
- Enter-your-name modal on first load (with session persistence)
- Welcome and leave chat toast notifications (Mantine Notifications)
- Online user count and typing indicator
- Copyable user ID badge
- Responsive and mobile-friendly

---

## 🛠️ Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the Socket.io server:**

   ```bash
   node server.js
   ```

3. **Start the Next.js development server:**

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 File Structure

- `src/app/ChatPage.tsx` — Main chat logic and state
- `src/app/components/ChatHeader.tsx` — Header UI (title, user, theme, logout)
- `src/app/components/MessagesList.tsx` — Message rendering
- `src/app/components/MessageInput.tsx` — Message input and send
- `src/app/components/NameModal.tsx` — Enter name modal
- `src/app/components/ConfirmExitModal.tsx` — Leave chat confirmation
- `src/app/components/logoutNotification.ts` — Toast notification utilities
- `src/app/ThemeProviderClient.tsx` — Mantine theme and notification provider
- `server.js` — Express + Socket.io backend

---

## 🖌️ Customization

- Edit notification messages in `src/app/components/logoutNotification.ts`
- Change UI or add features by editing the components in `src/app/components/`
- Update theme in `src/app/ThemeProviderClient.tsx`

---

## 📝 License

MIT

---

> For best results, add a screenshot of your app as `preview.png` in the project root.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
