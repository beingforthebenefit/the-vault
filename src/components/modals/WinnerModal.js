import React from 'react'
import { Modal, Button, Text } from '@nextui-org/react'

const WinnerModal = ({ isVisible, onClose, winningGame }) => (
  <Modal open={isVisible} onClose={onClose}>
    <Modal.Header>
      <Text size={18}>Winner: {winningGame?.name}</Text>
    </Modal.Header>
    <Modal.Body>
      <Button onClick={() => window.location.href = winningGame?.url}>Go to Game</Button>
    </Modal.Body>
  </Modal>
)

export default WinnerModal
