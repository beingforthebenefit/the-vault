import React from 'react'
import {Modal, Text, Button} from '@nextui-org/react'

const SelectGameModal = ({isVisible, onClose, games}) => (
    <Modal open={isVisible} onClose={onClose}>
        <Modal.Header>
            <Text size={18}>Select a Game</Text>
        </Modal.Header>
        <Modal.Body>
            {games.map(game => (
                <Button key={game.id} onClick={() => window.location.href = game.url}>{game.name}</Button>
            ))}
        </Modal.Body>
    </Modal>
)

export default SelectGameModal