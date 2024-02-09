import {useEffect} from 'react'
import backgroundImage from './assets/background.png'
import {Button, useState} from '@nextui-org/react'
import {db} from './firebase'

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

  useEffect(() => {
    const unsubscribe = db.collection('games').onSnapshot(snapshot => {
      const gamesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setGames(gamesData)
    })

    return unsubscribe
  }, [])

  const handleVote = (gameId) => {
    const gameRef = db.collection('games').doc(gameId)
    gameRef.update({ votes: games.find(game => game.id === gameId).votes + 1 })
  }

  return (
    <div style={appStyle}>
      <div style={buttonContainerStyle}>
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
