import backgroundImage from './assets/background.png'
import React, {useEffect, useState} from 'react'
import {Button, Modal, useModal, Text} from '@nextui-org/react'
import {db} from './firebase'
import {collection, onSnapshot, doc, updateDoc, increment} from 'firebase/firestore'

const appStyle = {
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}

const buttonContainerStyle = {
  display: 'flex',
  height: '100vh',
  width: '100vw',
  alignItems: 'center',
  justifyContent: 'center'
}

const buttonStyle = {
  width: '50%',
  display: 'flex',
  justifyContent: 'center'
}

function App() {
  const [games, setGames] = useState([])
  const {setVisible, bindings} = useModal()
  const [selectedGame, setSelectedGame] = useState(null)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'games'), (snapshot) => {
      setGames(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })))
    })

    return () => unsubscribe()
  }, [])

  const handleVote = async (gameId) => {
    const gameRef = doc(db, 'games', gameId)
    await updateDoc(gameRef, {votes: increment(1)})
  }

  const openModal = (game) => {
    setSelectedGame(game)
    setVisible(true)
  }

  return (
    <div style={appStyle}>
      <div style={buttonContainerStyle}>
        {games.map(game => (
          <div key={game.id} style={buttonStyle}>
            <Button shadow color="primary" onClick={() => openModal(game)}>{game.name}</Button>
          </div>
        ))}
        <Modal {...bindings}>
          <Modal.Header>
            <Text size={18}>
              {selectedGame ? `Vote for ${selectedGame.name}` : 'Select a Game'}
            </Text>
          </Modal.Header>
          <Modal.Body>
            {selectedGame && (
              <div>
                <Text>Do you want to vote for {selectedGame.name}?</Text>
                <Button color="success" onClick={() => handleVote(selectedGame.id)}>
                  Vote
                </Button>
              </div>
            )}
          </Modal.Body>
        </Modal>
        <div style={buttonStyle}>
          <Button shadow size="lg" color="primary">Vote on a Game</Button>
        </div>
        <div style={buttonStyle}>
          <Button shadow color="gradient">Select a Game</Button>
        </div>
      </div>
    </div>
  )
}

export default App
