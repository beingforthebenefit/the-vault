import React, {useEffect, useState, useCallback} from 'react'
import {Button, Modal, useModal, Text, Loading, Grid, Card} from '@nextui-org/react'
import backgroundImage from './assets/background.png'
import {db} from './firebase'
import {collection, onSnapshot, doc, writeBatch, getDoc} from 'firebase/firestore'
import {startVoting, handleVote, resetVotes, listenToTimerChanges} from './utils/firebaseUtils'
import SelectGameModal from './components/modals/SelectGameModal'
import WinnerModal from './components/modals/WinnerModal'

function App() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const {setVisible, bindings} = useModal()
  const [timerEnds, setTimerEnds] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [winnerModalVisible, setWinnerModalVisible] = useState(false)
  const [winningGame, setWinningGame] = useState(null)
  const [selectGameModalVisible, setSelectGameModalVisible] = useState(false)
  const [voteCast, setVoteCast] = useState(false)

  const resetVotesAfterWinner = useCallback(async () => {
    const batch = writeBatch(db)
    games.forEach(game => {
      const gameRef = doc(db, 'games', game.id)
      batch.update(gameRef, { votes: 0 })
    })
    await batch.commit()
  }, [games])

  const determineWinner = useCallback(() => {
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
    resetVotesAfterWinner()
  }, [games, setWinningGame, setWinnerModalVisible, resetVotesAfterWinner])

  const startCountdown = useCallback((endTime) => {
    const interval = setInterval(() => {
      const now = new Date()
      const timeLeft = Math.max(Math.floor((endTime - now) / 1000), 0)
      setSecondsLeft(timeLeft)

      if (timeLeft === 0) {
        clearInterval(interval)
        determineWinner()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [determineWinner])

  const onVoteButtonClick = async () => {
    await startVoting()
    setVisible(true)
  }

  useEffect(() => {
    const unsubscribeTimer = listenToTimerChanges(
      setTimerEnds,
      setSecondsLeft,
      determineWinner,
      setVisible
    )

    const unsubscribeGames = onSnapshot(collection(db, 'games'), (snapshot) => {
      setGames(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })))
      setLoading(false)
    })

    return () => {
      unsubscribeTimer()
      unsubscribeGames()
    }
  }, [setTimerEnds, setSecondsLeft, determineWinner, setVisible])

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

  const renderVoteModalContent = () => (
    <Modal {...bindings}>
      <Modal.Header>
        <Text size={18}>Vote for a Game</Text>
      </Modal.Header>
      <Modal.Body>
        {games.map(game => (
          <Button key={game.id} onClick={() => handleVote(game.id, setVoteCast, setVisible)}>{game.name}</Button>
        ))}
      </Modal.Body>
    </Modal>
  )

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', padding: 0, margin: 0, width: '100vw', height: '100vh' }}>
      {loading ? <Loading size="lg" /> : (
        <>
          <Text h1 align="center" color="white" style={{ paddingTop: 20 }}>The Vault</Text>
          {voteCast && <Text shadow size={24} align="center" color="white" style={{ paddingTop: 150 }}>Vote Cast!</Text>}
          <Grid.Container gap={2} justify="center" alignItems="center" style={{ minHeight: '80vh' }}>
            <Grid xs={6} justify="center">
              <Button shadow size="lg" color="gradient" onClick={onVoteButtonClick} disabled={voteCast}>Vote on a Game</Button>
            </Grid>
            <Grid xs={6} justify="center">
              <Button shadow size="lg" color="gradient" onClick={() => setSelectGameModalVisible(true)} disabled={voteCast}>Select a Game</Button>
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
          <Button size="sm" auto color="error" onClick={() => resetVotes(games)} style={{ position: 'absolute', top: 20, right: 20 }}>Reset Votes</Button>
          {renderVoteModalContent()}
          <SelectGameModal isVisible={selectGameModalVisible} onClose={() => setSelectGameModalVisible(false)} games={games} />
          {/* <WinnerModal isVisible={winnerModalVisible} onClose={() => setWinnerModalVisible(false)} winningGame={winningGame} /> */}
        </>
      )}
      {secondsLeft > 0 && <Text size={18} color="white" style={{ position: 'absolute', bottom: 20, right: 20 }}>Voting ends in: {secondsLeft} seconds</Text>}
    </div>
  )
}

export default App
