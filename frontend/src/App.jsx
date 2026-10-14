import { useState } from 'react'
import Login from './components/Login'
import Cadastro from './components/Cadastro'
import CadastroProduto from './components/CadProdutos';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    {/*<Login />
    <Cadastro />*/}
    <CadastroProduto />


    </>
  )
}

export default App
