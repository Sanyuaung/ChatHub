"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import {
  Container,
  Paper,
  ScrollArea,
  Box,
  rem,
  useMantineTheme,
  useMantineColorScheme,
  Text as MantineText,
} from "@mantine/core";

import ChatHeader from "./components/ChatHeader";
import MessagesList from "./components/MessagesList";
import MessageInput from "./components/MessageInput";
import NameModal from "./components/NameModal";
import ConfirmExitModal from "./components/ConfirmExitModal";
import VideoCall from "./components/VideoCall";
import {
  showLogoutNotification,
  showWelcomeNotification,
} from "./components/logoutNotification";
import { useRefreshWarning } from "./components/useRefreshWarning";

// Move socket connection inside component to avoid SSR issues
let socket: any;

export default function ChatPage() {
  const [sending, setSending] = useState(false);
  const [wakeUpAttempted, setWakeUpAttempted] = useState(false);
  const [wakeUpIframeVisible, setWakeUpIframeVisible] = useState(false);
  useRefreshWarning();
  const [name, setName] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    {
      name: string;
      message: string;
      image?: string;
      id: string;
      timestamp: Date;
      userId: string;
    }[]
  >([]);
  const [typing, setTyping] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const feedbackTimeout = useRef<NodeJS.Timeout | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const userIdRef = useRef<string>(""); // Use ref to avoid re-renders

  const theme = useMantineTheme();

  // Color scheme based on dark/light mode
  const colors = {
    background: isDark ? theme.colors.dark[8] : "#f8fafc",
    surface: isDark ? theme.colors.dark[7] : "#ffffff",
    primary: isDark ? theme.colors.indigo[6] : theme.colors.indigo[6],
    secondary: isDark ? theme.colors.indigo[4] : theme.colors.indigo[4],
    text: isDark ? theme.colors.gray[0] : theme.colors.dark[9],
    textSecondary: isDark ? theme.colors.gray[4] : theme.colors.gray[6],
    border: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
    userBubble: isDark ? theme.colors.indigo[8] : theme.colors.indigo[6],
    otherBubble: isDark ? theme.colors.dark[6] : "#f1f5f9",
  };

  // Send image as base64 string
  const sendImage = (base64: string) => {
    if (!name.trim() || !userId) return;
    setSending(true);
    const messageData = {
      name: name.trim(),
      message: "", // No text
      image: base64,
      id: typeof window !== "undefined" ? Date.now().toString() : "",
      userId: userId,
      timestamp: typeof window !== "undefined" ? new Date().toISOString() : "",
    };
    socket.emit("chat", messageData);
  };

  // On mount, check for name and userId in sessionStorage (client only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedName = sessionStorage.getItem("chat-user-name");
    if (storedName) {
      setName(storedName);
      setShowNameModal(false);
    } else {
      setShowNameModal(true);
    }
    const storedUserId = sessionStorage.getItem("chat-user-id");
    if (storedUserId) {
      setUserId(storedUserId);
      userIdRef.current = storedUserId;
    } else {
      const newUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
      setUserId(newUserId);
      userIdRef.current = newUserId;
      sessionStorage.setItem("chat-user-id", newUserId);
    }
  }, []);

  // Handler for name modal submit
  const handleNameSubmit = (enteredName: string) => {
    setName(enteredName);
    sessionStorage.setItem("chat-user-name", enteredName);
    setShowNameModal(false);
    showWelcomeNotification(enteredName); // Show welcome notification with entered name
  };

  // Handler for exit button (shows confirmation modal)
  const handleExit = () => {
    setShowExitModal(true);
  };

  // Confirm leave chat
  const confirmLeaveChat = () => {
    setName("");
    setMessages([]); // Clear message list
    sessionStorage.removeItem("chat-user-name");
    setShowNameModal(true);
    setShowExitModal(false);
    showLogoutNotification();
  };

  // Cancel leave chat
  const cancelLeaveChat = () => {
    setShowExitModal(false);
  };

  useEffect(() => {
    if (!userId) return;
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
    function connectSocket() {
      socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        query: {
          userId: userId,
          tabId: Math.random().toString(36).substr(2, 9),
        },
      });
      socket.on("connect", () => {
        setIsConnected(true);
        setWakeUpIframeVisible(false);
        console.log("Connected to server");
      });
      socket.on("disconnect", () => {
        setIsConnected(false);
        console.log("Disconnected from server");
      });
      socket.on("connect_error", () => {
        if (!wakeUpAttempted) {
          setWakeUpAttempted(true);
          setWakeUpIframeVisible(true);
          // Try to reconnect after 7 seconds
          setTimeout(() => {
            setWakeUpIframeVisible(false);
            connectSocket();
          }, 7000);
        }
      });
    }
    connectSocket();
    socket.on(
      "chat",
      (data: {
        name: string;
        message: string;
        image?: string;
        id: string;
        userId: string;
        timestamp: string;
      }) => {
        setMessages((prev) => [
          ...prev,
          {
            ...data,
            timestamp: new Date(data.timestamp),
            userId: data.userId,
          },
        ]);
        setTyping("");
        if (data.userId === userId) {
          setMessage("");
          setSending(false);
        }
      }
    );
    socket.on("typing", (name: string) => {
      setTyping(`${name} is typing .....`);
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => setTyping(""), 3000);
    });
    socket.on("users", (count: number) => {
      setOnlineUsers(count);
    });
    socket.on("messageHistory", (history: any[]) => {
      const formattedHistory = history.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        userId: msg.userId,
      }));
      setMessages(formattedHistory);
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chat");
      socket.off("typing");
      socket.off("users");
      socket.off("messageHistory");
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [userId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]); // Remove typing from dependencies

  const scrollToBottom = () => {
    if (viewport.current) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const sendMessage = () => {
    if (!name.trim() || !message.trim() || !userId) return;
    setSending(true);
    // Only generate IDs and timestamps on the client
    const messageData = {
      name: name.trim(),
      message: message.trim(),
      id: typeof window !== "undefined" ? Date.now().toString() : "",
      userId: userId,
      timestamp: typeof window !== "undefined" ? new Date().toISOString() : "",
    };
    socket.emit("chat", messageData);
  };

  const handleTyping = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (name.trim() && userId) {
      socket.emit("typing", name.trim());
    }
  };

  // Remove Enter key send logic to match old version

  const formatTime = (date: Date) => {
    if (typeof window === "undefined") return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getUserInitials = (userName: string) => {
    return userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (userName: string) => {
    const colors = [
      theme.colors.blue[6],
      theme.colors.red[6],
      theme.colors.green[6],
      theme.colors.violet[6],
      theme.colors.orange[6],
      theme.colors.cyan[6],
      theme.colors.pink[6],
      theme.colors.grape[6],
    ];
    const index = userName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getUserIdDisplay = () => {
    return userId ? `User ID: ${userId.substring(0, 12)}...` : "Connecting...";
  };

  // Show modal for name entry or initializing if not connected
  if (!userId || !isConnected) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: isDark
            ? `linear-gradient(135deg, ${theme.colors.dark[8]} 0%, ${theme.colors.dark[7]} 100%)`
            : `linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)`,
          color: colors.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: rem(16),
          fontFamily: "Inter, sans-serif",
        }}
      >
        <Container size={480} p={0} style={{ width: "100%", maxWidth: 480 }}>
          <MantineText
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#60a5fa",
              textAlign: "center",
              marginTop: 32,
              animation: "glowFade 2s infinite",
            }}
          >
            Initializing chat...
            <br />
            {wakeUpIframeVisible && (
              <>
                <span
                  style={{
                    fontSize: 16,
                    color: "#60a5fa",
                    display: "block",
                    marginTop: 16,
                  }}
                >
                  Waking up server, please wait...
                </span>
                <iframe
                  src={process.env.NEXT_PUBLIC_SOCKET_URL}
                  style={{ display: "none" }}
                  title="WakeUpRender"
                />
              </>
            )}
            <style jsx>{`
              @keyframes glowFade {
                0% {
                  opacity: 0.6;
                  text-shadow: 0 0 8px #3b82f6, 0 0 16px #60a5fa;
                }
                50% {
                  opacity: 1;
                  text-shadow: 0 0 24px #3b82f6, 0 0 48px #60a5fa;
                }
                100% {
                  opacity: 0.6;
                  text-shadow: 0 0 8px #3b82f6, 0 0 16px #60a5fa;
                }
              }
            `}</style>
          </MantineText>
        </Container>
      </Box>
    );
  }

  if (showNameModal) {
    return <NameModal opened={showNameModal} onSubmit={handleNameSubmit} />;
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: isDark
          ? `linear-gradient(135deg, ${theme.colors.dark[8]} 0%, ${theme.colors.dark[7]} 100%)`
          : `linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)`,
        color: colors.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: rem(16),
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Container size={480} p={0} style={{ width: "100%", maxWidth: 480 }}>
        <Paper
          shadow="xl"
          radius={24}
          p={0}
          withBorder
          style={{
            background: colors.surface,
            color: colors.text,
            overflow: "hidden",
            border: `1px solid ${colors.border}`,
            height: "600px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ChatHeader
            isConnected={isConnected}
            onlineUsers={onlineUsers}
            userId={userId}
            isDark={isDark}
            colors={colors}
            theme={theme}
            typing={typing}
            toggleColorScheme={toggleColorScheme}
            name={name}
            onExit={handleExit}
          />
          {/* Video Call UI */}
          {/* <Box style={{ margin: "16px 0" }}>
            <VideoCall signalingSocket={socket} userId={userId} />
          </Box> */}
          <ScrollArea
            viewportRef={viewport}
            type="auto"
            offsetScrollbars
            style={{
              background: isDark ? theme.colors.dark[8] : "#f8fafc",
              flex: 1,
              padding: rem(16),
            }}
          >
            <MessagesList
              messages={messages}
              userId={userId}
              colors={colors}
              theme={theme}
              viewport={viewport as React.RefObject<HTMLDivElement>}
              isDark={isDark}
              getUserInitials={getUserInitials}
              getRandomColor={getRandomColor}
              formatTime={formatTime}
            />
          </ScrollArea>
          <Box
            style={{
              background: colors.surface,
              padding: rem(20),
              borderTop: `1px solid ${colors.border}`,
              flexShrink: 0,
            }}
          >
            <MessageInput
              name={name}
              setName={setName}
              message={message}
              setMessage={setMessage}
              sendMessage={sendMessage}
              sendImage={sendImage}
              handleTyping={handleTyping}
              isDark={isDark}
              colors={colors}
              theme={theme}
              isConnected={isConnected}
              sending={sending}
            />
            <ConfirmExitModal
              opened={showExitModal}
              onConfirm={confirmLeaveChat}
              onCancel={cancelLeaveChat}
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
