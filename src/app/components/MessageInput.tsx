import {
  Textarea,
  Group,
  Button,
  ActionIcon,
  useMantineTheme,
  TextInput,
} from "@mantine/core";
import { IconSend, IconLogout } from "@tabler/icons-react";
import React from "react";

// Assuming 'colors' and 'theme' are now retrieved using Mantine hooks if possible,
// but keeping them in props for compatibility with your original structure.
interface MessageInputProps {
  name: string; // Kept for the 'disabled' logic, but the TextInput is removed.
  setName: (name: string) => void; // Removed as TextInput is removed
  message: string;
  setMessage: (msg: string) => void;
  sendMessage: () => void;
  handleTyping: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  isDark: boolean;
  colors: any; // Ideally use theme.colors, but kept for compatibility
  theme: any; // Ideally use useMantineTheme(), but kept for compatibility
  isConnected: boolean;
  onExit?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  name,
  setName,
  message,
  setMessage,
  sendMessage,
  handleTyping,
  isDark,
  colors,
  theme,
  isConnected,
  onExit,
}) => {
  // Use a local variable to check if message can be sent
  const canSendMessage = name.trim() && message.trim() && isConnected;

  return (
    // Use Group to handle the main input area and a small Stack for actions
    <div
    // style={{
    //   padding: 8,
    //   borderTop: isDark
    //     ? `1px solid ${theme.colors.dark[4]}`
    //     : `1px solid ${theme.colors.gray[3]}`,
    // }}
    >
      {/* Optional Exit Button/Indicator for Context */}
      {/* {onExit && (
        <Group justify="flex-end" mb="xs">
          <Button
            variant="light"
            color="red" // Changed to red for 'Exit/Logout' semantic
            radius="xl"
            size="compact-sm"
            onClick={onExit}
            leftSection={<IconLogout size={16} />}
          >
            Leave Chat
          </Button>
        </Group>
      )} */}

      {/* Main Message Input Area */}
      <Group align="flex-end" gap="xs" wrap="nowrap">
        <TextInput
          style={{ display: "none" }} // Hidden TextInput for name, as per new design
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTyping}
          radius="xl" // Use a higher radius for a modern feel
          size="md"
          autosize
          minRows={1} // Start with 1 row for a compact look
          maxRows={6}
          style={{ flexGrow: 1 }}
          disabled={!name.trim() || !isConnected} // Disable if no name or disconnected
          styles={{
            input: {
              background: isDark ? theme.colors.dark[7] : theme.colors.gray[0],
              color: colors.text,
              borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[3],
              fontWeight: 400,
              paddingRight: 40, // Add padding for an absolute button inside if you choose that route
              "&:focus": {
                borderColor: colors.primary,
              },
              "&:disabled": {
                // Dimmed, but not completely disabled-looking
                backgroundColor: isDark
                  ? theme.colors.dark[5]
                  : theme.colors.gray[2],
                color: isDark ? theme.colors.dark[2] : theme.colors.gray[6],
              },
            },
          }}
        />

        {/* Send Button: ActionIcon is better for a compact chat UI */}
        <ActionIcon
          onClick={sendMessage}
          variant="filled"
          color="indigo" // Use your primary color
          radius="xl"
          size={42} // Adjust size to match the Textarea height
          disabled={!canSendMessage}
          aria-label="Send Message"
        >
          <IconSend size={20} />
        </ActionIcon>
      </Group>
    </div>
  );
};

export default MessageInput;
