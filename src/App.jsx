import './App.css'
import {Button, Container} from '@nextui-org/react'

function App() {
  return (
    <Container css={{ d: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div css={{ display: 'flex', width: '100%', justifyContent: 'space-around' }}>
        <Button shadow color="gradient">Vote on a Game</Button>
        <Button shadow color="gradient">Select a Game</Button>
      </div>
    </Container>
  )
}

export default App;
