import backgroundImage from './assets/background.png'
import {Button} from '@nextui-org/react'

function App() {

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
