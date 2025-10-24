import { useEffect } from "react";
import { modals } from "@mantine/modals";

export function useRefreshWarning() {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      modals.openConfirmModal({
        title: "Are you sure?",
        children: "Refreshing will clear your message list. Continue?",
        labels: { confirm: "Refresh Anyway", cancel: "Stay" },
        onConfirm: () => {
          window.removeEventListener("beforeunload", handleBeforeUnload);
          window.location.reload();
        },
        onCancel: () => {},
      });
      e.preventDefault();
      e.returnValue = "Refreshing will clear your message list.";
      return "Refreshing will clear your message list.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
}
