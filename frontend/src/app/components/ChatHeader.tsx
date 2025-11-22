import {
  Group,
  Box,
  Title,
  Badge,
  Text as MantineText,
  ActionIcon,
  Tooltip,
  CopyButton,
  Button,
  Stack,
} from "@mantine/core";
import {
  IconSun,
  IconMoon,
  IconCopy,
  IconCheck,
  IconLogout,
  IconMessageCircle, // New icon for the title
} from "@tabler/icons-react";
import React from "react";

interface ChatHeaderProps {
  isConnected: boolean;
  onlineUsers: number;
  userId: string;
  isDark: boolean;
  colors: any;
  theme: any;
  typing: string;
  toggleColorScheme: () => void;
  name?: string;
  onExit?: () => void;
  locationStatus?: "idle" | "requesting" | "active" | "denied";
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  isConnected,
  onlineUsers,
  userId,
  isDark,
  colors,
  theme,
  typing,
  toggleColorScheme,
  name,
  onExit,
  locationStatus,
}) => {
  const headerTextColor = theme.white;

  return (
    <Box
      style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        padding: theme.spacing.md,
        flexShrink: 0,
        boxShadow: theme.shadows.sm,
        position: "relative",
      }}
    >
      {/* Top left: Logout Icon */}
      {onExit && (
        <ActionIcon
          onClick={onExit}
          color="red"
          variant="light"
          title="Leave Chat"
          size="lg"
          style={{ position: "absolute", top: 16, left: 16, zIndex: 2 }}
          aria-label="Leave Chat"
        >
          <IconLogout size={22} />
        </ActionIcon>
      )}

      <Group justify="space-between" align="center" wrap="nowrap">
        {/* Center: Main Title with Icon */}
        <Group justify="center" style={{ flexGrow: 1 }}>
          {" "}
          {/* flexGrow makes it take available space */}
          <IconMessageCircle size={28} style={{ color: headerTextColor }} />
          <Title
            order={2}
            style={{
              color: headerTextColor,
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: -0.5,
              marginLeft: theme.spacing.xs, // Small spacing between icon and text
            }}
          >
            Chat Hub
          </Title>
        </Group>

        {/* Rightmost: Theme Toggle */}
        <ActionIcon
          variant="transparent"
          color="white"
          size="lg"
          onClick={toggleColorScheme}
          style={{
            flexShrink: 0,
            transition: "background-color 0.2s",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          {isDark ? <IconSun size={24} /> : <IconMoon size={24} />}
        </ActionIcon>
      </Group>

      {/* Second row for badges (moved here for better centering of title) */}

      <Group justify="center" gap="xs" wrap="wrap" mt="sm">
        {/* User Name/ID Badge */}
        <CopyButton value={userId} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? "Copied!" : "Copy User ID"} withArrow>
              <Badge
                variant="light"
                color="indigo"
                size="md"
                radius="xl"
                onClick={copy}
                style={{
                  cursor: "pointer",
                  background: "rgba(255, 255, 255, 0.2)",
                  color: headerTextColor,
                }}
              >
                <Group
                  gap={4}
                  wrap="nowrap"
                  style={{ maxWidth: name ? 180 : 120 }}
                >
                  <MantineText fw={500} size="sm" truncate>
                    {name || `ID: ${userId.slice(0, 8)}...`}
                  </MantineText>
                  {copied ? (
                    <IconCheck size={14} style={{ color: headerTextColor }} />
                  ) : (
                    <IconCopy size={14} style={{ color: headerTextColor }} />
                  )}
                </Group>
              </Badge>
            </Tooltip>
          )}
        </CopyButton>

        {/* Connection Status & Online Users */}
        <Badge
          variant="filled"
          color={isConnected ? "green" : "red"}
          size="md"
          radius="xl"
          style={{ minWidth: 90 }}
        >
          {isConnected ? `${onlineUsers} Online` : "Offline"}
        </Badge>

        {/* Typing Indicator - prominent when active */}
        {typing && (
          <Badge variant="filled" color="yellow" size="md" radius="xl">
            {typing} is typing...
          </Badge>
        )}

        {/* Location Tracking Status */}
        {locationStatus && (
          <Tooltip
            label={
              locationStatus === "denied"
                ? "Location access denied. Tap to enable in Chrome settings"
                : locationStatus === "requesting"
                ? "Requesting location access (close any overlays)"
                : locationStatus === "active"
                ? "Location tracking active"
                : "Location tracking disabled"
            }
            withArrow
          >
            <Badge
              variant="filled"
              color={
                locationStatus === "active"
                  ? "cyan"
                  : locationStatus === "requesting"
                  ? "yellow"
                  : locationStatus === "denied"
                  ? "red"
                  : "gray"
              }
              size="md"
              radius="xl"
            >
              {locationStatus === "active" && "📍 Tracking"}
              {locationStatus === "requesting" && "⏳ Requesting"}
              {locationStatus === "denied" && "❌ No Location"}
              {locationStatus === "idle" && "⏸️ Idle"}
            </Badge>
          </Tooltip>
        )}
      </Group>
    </Box>
  );
};

export default ChatHeader;
