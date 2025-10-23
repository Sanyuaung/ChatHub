import { Modal, TextInput, Button, Stack } from "@mantine/core";
import React, { useState } from "react";

interface NameModalProps {
  opened: boolean;
  onSubmit: (name: string) => void;
}

const NameModal: React.FC<NameModalProps> = ({ opened, onSubmit }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setError("");
    onSubmit(name.trim());
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {}}
      withCloseButton={false}
      centered
      title="Enter your name"
    >
      <Stack>
        <TextInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          autoFocus
        />
        <Button onClick={handleSubmit} fullWidth>
          Enter Chat
        </Button>
      </Stack>
    </Modal>
  );
};

export default NameModal;
