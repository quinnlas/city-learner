import './App.css'
import Canvas from './Canvas'

function App() {
  return (
    <>
      {/* TODO get starting size from viewport */}
      {/* -10 is to avoid scrollbar, not sure exact amount needed */}
      <Canvas width={1440 - 40*2 - 32*2} height={843 - 32*2 - 10}/>
    </>
  )
}

export default App
