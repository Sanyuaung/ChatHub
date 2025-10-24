import { Modal, Button, Group, Text } from "@mantine/core";
import React from "react";

interface ConfirmExitModalProps {
  opened: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmExitModal: React.FC<ConfirmExitModalProps> = ({
  opened,
  onConfirm,
  onCancel,
}) => (
  <Modal
    opened={opened}
    onClose={onCancel}
    withCloseButton={false}
    centered
    title="Leave Chat?"
  >
    <Text mb="md">Are you sure you want to leave the chat?</Text>
    <Group justify="flex-end">
      <Button variant="default" onClick={onCancel}>
        Cancel
      </Button>
      <Button color="red" onClick={onConfirm}>
        Leave
      </Button>
    </Group>
  </Modal>
);

export default ConfirmExitModal;
