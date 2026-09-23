import { useState } from 'react'
import Login from './components/Login'
import Cadastro from './components/Cadastro'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Login />
    <Cadastro />
    </>
  )
}

export default App
