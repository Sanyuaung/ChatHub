import React from "react";
import {
  Textarea,
  Group,
  ActionIcon,
  TextInput,
  Box,
  Text as MantineText,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconSend } from "@tabler/icons-react";

interface MessageInputProps {
  sendImage?: (base64: string) => void;
  name: string;
  setName: (name: string) => void;
  message: string;
  setMessage: (msg: string) => void;
  sendMessage: () => void;
  handleTyping: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  isDark: boolean;
  colors: any;
  theme: any;
  isConnected: boolean;
  sending?: boolean;
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
  sendImage,
  sending,
}) => {
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      showNotification({
        title: "Image too large",
        message: "Image size must be less than 1MB.",
        color: "red",
        autoClose: 2500,
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const canSendMessage =
    name.trim() && (message.trim() || imagePreview) && isConnected;

  return (
    <div>
      <Group align="flex-end" gap="xs" wrap="nowrap">
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          id="chat-image-upload"
          onChange={handleImageUpload}
        />
        <label htmlFor="chat-image-upload">
          <ActionIcon
            component="span"
            variant="light"
            color="indigo"
            radius="xl"
            size={42}
            aria-label="Upload Image"
            style={{ marginRight: 4 }}
            disabled={!name.trim() || !isConnected}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 16V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12" />
              <rect x="4" y="16" width="16" height="4" rx="2" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </ActionIcon>
        </label>
        <TextInput
          style={{ display: "none" }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Box style={{ flexGrow: 1 }}>
          {imagePreview && (
            <Box mb={8} style={{ textAlign: "left" }}>
              <img
                src={imagePreview}
                alt="preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: 180,
                  borderRadius: 10,
                  marginBottom: 4,
                  display: "block",
                }}
              />
            </Box>
          )}
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleTyping}
            radius="xl"
            size="md"
            autosize
            minRows={1}
            maxRows={6}
            disabled={!name.trim() || !isConnected}
            styles={{
              input: {
                background: isDark
                  ? theme.colors.dark[7]
                  : theme.colors.gray[0],
                color: colors.text,
                borderColor: isDark
                  ? theme.colors.dark[4]
                  : theme.colors.gray[3],
                fontWeight: 400,
                paddingRight: 40,
                "&:focus": {
                  borderColor: colors.primary,
                },
                "&:disabled": {
                  backgroundColor: isDark
                    ? theme.colors.dark[5]
                    : theme.colors.gray[2],
                  color: isDark ? theme.colors.dark[2] : theme.colors.gray[6],
                },
              },
            }}
          />
          {/* Show sending info */}
          {sending && (
            <MantineText size="sm" c="indigo" style={{ marginTop: 8 }}>
              Sending ...
            </MantineText>
          )}
        </Box>
        <ActionIcon
          onClick={() => {
            if (imagePreview && sendImage) {
              sendImage(imagePreview);
              setImagePreview(null);
            }
            if (canSendMessage && sendMessage) {
              sendMessage();
            }
          }}
          variant="filled"
          color="indigo"
          radius="xl"
          size={42}
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
