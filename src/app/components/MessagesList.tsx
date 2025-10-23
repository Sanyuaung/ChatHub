import {
  Stack,
  Group,
  Avatar,
  Box,
  Text as MantineText,
  Paper,
  Center,
} from "@mantine/core";
import React from "react";

interface Message {
  name: string;
  message: string;
  id: string;
  timestamp: Date;
  userId: string;
}

interface MessagesListProps {
  messages: Message[];
  userId: string;
  colors: any;
  theme: any;
  viewport: React.RefObject<HTMLDivElement>;
  isDark: boolean;
  getUserInitials: (name: string) => string;
  getRandomColor: (name: string) => string;
  formatTime: (date: Date) => string;
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  userId,
  colors,
  theme,
  viewport,
  isDark,
  getUserInitials,
  getRandomColor,
  formatTime,
}) => (
  <>
    {messages.length === 0 ? (
      <Center style={{ height: "100%", minHeight: "300px" }}>
        <Box style={{ textAlign: "center" }}>
          <MantineText
            size="lg"
            c={colors.textSecondary}
            style={{ fontStyle: "italic", marginBottom: 8 }}
          >
            No messages yet
          </MantineText>
          <MantineText size="sm" c={colors.textSecondary}>
            Start the conversation!
          </MantineText>
        </Box>
      </Center>
    ) : (
      <Stack gap="md">
        {messages.map((msg) => (
          <Group
            key={msg.id}
            align="flex-start"
            wrap="nowrap"
            style={{
              flexDirection: msg.userId === userId ? "row-reverse" : "row",
            }}
          >
            <Avatar
              size="sm"
              radius="xl"
              style={{
                background: getRandomColor(msg.name),
                color: "white",
                fontWeight: 600,
                marginLeft: msg.userId === userId ? 8 : 0,
                marginRight: msg.userId === userId ? 0 : 8,
                flexShrink: 0,
              }}
            >
              {getUserInitials(msg.name)}
            </Avatar>
            <Box
              style={{
                maxWidth: "70%",
                display: "flex",
                flexDirection: "column",
                alignItems: msg.userId === userId ? "flex-end" : "flex-start",
              }}
            >
              <MantineText
                size="xs"
                style={{
                  fontWeight: 600,
                  color:
                    msg.userId === userId
                      ? theme.colors.indigo[2]
                      : theme.colors.indigo[4],
                  marginBottom: 4,
                  paddingLeft: 8,
                  paddingRight: 8,
                }}
              >
                {msg.name} {msg.userId === userId && "(You)"}
              </MantineText>
              <Paper
                shadow="sm"
                radius={16}
                p="sm"
                style={{
                  background:
                    msg.userId === userId
                      ? colors.userBubble
                      : colors.otherBubble,
                  color: msg.userId === userId ? "white" : colors.text,
                  border: `1px solid ${
                    msg.userId === userId ? colors.primary : colors.border
                  }`,
                  borderBottomRightRadius: msg.userId === userId ? 4 : 16,
                  borderBottomLeftRadius: msg.userId === userId ? 16 : 4,
                }}
              >
                <MantineText
                  size="sm"
                  style={{ lineHeight: 1.4, wordBreak: "break-word" }}
                >
                  {msg.message}
                </MantineText>
              </Paper>
              <MantineText
                size="xs"
                style={{
                  color:
                    msg.userId === userId
                      ? theme.colors.indigo[3]
                      : colors.textSecondary,
                  marginTop: 4,
                  paddingLeft: 8,
                  paddingRight: 8,
                }}
              >
                {formatTime(msg.timestamp)}
              </MantineText>
            </Box>
          </Group>
        ))}
      </Stack>
    )}
  </>
);

export default MessagesList;
