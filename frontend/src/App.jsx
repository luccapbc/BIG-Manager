import { useState } from 'react'
import Login from './components/Login'
import Cadastro from './components/Cadastro'
import CadastroProduto from './components/CadProdutos'
import Dashboard from './components/Dashboard'


function App() {
  // Qual tela está aparecendo: 'login' | 'cadastro' | 'produto'
  // Se já existe um token salvo (a pessoa já logou antes), abre direto no produto

 /* const [tela, setTela] = useState(() =>
    localStorage.getItem('bigmanager_token') ? 'produto' : 'login'
  )

  if (tela === 'cadastro') {
    return (
      <Cadastro
        onIrParaLogin={() => setTela('login')}
        onCadastroSucesso={() => setTela('login')}
      />
    )
  }

  if (tela === 'produto') {
    return <CadastroProduto />
  }*/

    //ISSO É A LOGICA QUE DEVE FICAR NO RETURN 👇👇

        //---------------------------------
    
           /*<Login
          onIrParaCadastro={() => setTela('cadastro')}
          onLoginSucesso={() => setTela('produto')}
        />*/
    
        //-------------------------

  return (
    <Dashboard />
    
 
      

  )
}

export default App