import React, {useEffect, useState} from 'react'
import {Button, Modal, useModal, Text, Loading, Grid, Card} from '@nextui-org/react'
import backgroundImage from './assets/background.png'
import {db} from './firebase'
import {collection, onSnapshot, doc, updateDoc, increment, writeBatch, setDoc, getDoc, Timestamp} from 'firebase/firestore'

function App() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const {setVisible, bindings} = useModal()
  const [timerEnds, setTimerEnds] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [winnerModalVisible, setWinnerModalVisible] = useState(false)
  const [winningGame, setWinningGame] = useState(null)

  useEffect(() => {
    const timerRef = doc(db, 'timer', 'timer')
    getDoc(timerRef).then(docSnap => {
      if (docSnap.exists()) {
        const timerEndsAt = docSnap.data().votingEndsAt.toDate()
        setTimerEnds(timerEndsAt)
      }
    })
  }, [])

  useEffect(() => {
    const determineWinner = () => {
      let maxVotes = -1
      let winner = null
  
      games.forEach(game => {
        if (game.votes > maxVotes) {
          maxVotes = game.votes
          winner = game
        }
      })
  
      setWinningGame(winner)
      setWinnerModalVisible(true)
    }

    if (timerEnds) {
      const interval = setInterval(() => {
        const now = new Date()
        const timeLeft = Math.max(Math.floor((timerEnds - now) / 1000), 0)
        setSecondsLeft(timeLeft)

        if (timeLeft === 0) {
          clearInterval(interval)
          determineWinner()
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [timerEnds, games])

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'games'), (snapshot) => {
      setGames(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })))
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const startVoting = async () => {
    const now = new Date()
    if (!timerEnds || now > timerEnds) {
      const newTimerEnds = new Date(now.getTime() + 60000) // 60 seconds from now
      const timerRef = doc(db, 'timer', 'timer')
      await setDoc(timerRef, { votingEndsAt: Timestamp.fromDate(newTimerEnds) })
      setTimerEnds(newTimerEnds)
    }
    setVisible(true)
  }

  const handleVote = async (gameId) => {
    const gameRef = doc(db, 'games', gameId)
    await updateDoc(gameRef, { votes: increment(1) })
    setVisible(false)
  }

  const resetVotes = async () => {
    const batch = writeBatch(db)
    games.forEach(game => {
      const gameRef = doc(db, 'games', game.id)
      batch.update(gameRef, { votes: 0 })
    })
    await batch.commit()
  }

  const openVoteModal = () => {
    setVisible(true)
  }

  const renderVoteModalContent = () => (
    <Modal {...bindings}>
      <Modal.Header>
        <Text size={18}>Vote for a Game</Text>
      </Modal.Header>
      <Modal.Body>
        {games.map(game => (
          <Button key={game.id} onClick={() => handleVote(game.id)}>{game.name}</Button>
        ))}
      </Modal.Body>
    </Modal>
  )

  const renderWinnerModal = () => (
    <Modal open={winnerModalVisible} onClose={() => setWinnerModalVisible(false)}>
      <Modal.Header>
        <Text size={18}>Winner: {winningGame?.name}</Text>
      </Modal.Header>
      <Modal.Body>
        <Button onClick={() => window.location.href = winningGame?.url}>Go to Game</Button>
      </Modal.Body>
    </Modal>
  )

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', padding: 0, margin: 0, width: '100vw', height: '100vh' }}>
      {loading ? <Loading size="lg" /> : (
        <>
          <Grid.Container gap={2} justify="center" alignItems="center" style={{ minHeight: '80vh' }}>
            <Grid xs={6} justify="center">
              <Button shadow size="lg" color="primary" onClick={startVoting}>Vote on a Game</Button>
            </Grid>
            <Grid xs={6} justify="center">
              <Button shadow color="gradient">Select a Game</Button>
            </Grid>
          </Grid.Container>
          <Grid.Container gap={2} justify="center" style={{ minHeight: '20vh', padding: '10px' }}>
            {games.map(game => (
              <Grid xs={3} key={game.id}>
                <Card shadow hoverable clickable css={{ h: '100%', d: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <Text size={18} weight="bold" css={{ textAlign: 'center' }}>{game.name}</Text>
                  <Text css={{ textAlign: 'center' }}>Votes: {game.votes}</Text>
                </Card>
              </Grid>
            ))}
          </Grid.Container>
          <Button size="sm" auto color="error" onClick={resetVotes} style={{ position: 'absolute', top: 20, right: 20 }}>Reset Votes</Button>
          {secondsLeft > 0 && <Text size={18} color="white" style={{ position: 'absolute', bottom: 20, right: 20 }}>Voting ends in: {secondsLeft} seconds</Text>}
        </>
      )}
      {renderVoteModalContent()}
      {secondsLeft > 0 && <Text size={18} color="white" style={{ position: 'absolute', bottom: 20, right: 20 }}>Voting ends in: {secondsLeft} seconds</Text>}
      {renderWinnerModal()}
    </div>
  )
}

export default App
