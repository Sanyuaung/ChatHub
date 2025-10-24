export function showWelcomeNotification(name: string) {
  showNotification({
    title: `Welcome, ${name}!`,
    message: "You have joined the chat.",
    color: "blue",
    autoClose: 2500,
    withCloseButton: true,
  });
}
import { showNotification } from "@mantine/notifications";

export function showLogoutNotification() {
  showNotification({
    title: "Left Chat",
    message: "You have left the chat successfully.",
    color: "green",
    autoClose: 2500,
    withCloseButton: true,
  });
}
