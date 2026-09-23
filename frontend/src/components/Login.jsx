import { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    if (!email || !senha) {
      setErro('Preencha email e senha.');
      return;
    }

    setErro('');
    // A lógica de entrar de verdade (chamar o back-end, trocar de tela, etc)
    // entra aqui depois. Por enquanto, a tela só valida os campos.
    console.log('Login enviado:', { email, senha });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className=" w-full max-w-lg bg-white border border-gray-200 rounded-full p-20 shadow-[0_0_15px_5px] shadow-gray-300/80 trasnsition duration-300 hover:shadow-[0_0_15px_5px] hover:shadow-[#185FA5]/45">

        <h1 className="text-xl font-medium mb-1 text-center">
          <span className="text-[#185FA5]">BigManager</span>
        
        </h1>
        <p className="text-sm text-gray-500 mb-7 text-center">
          Entre para acessar seu dashboard de produtos.
        </p>

        {erro && (
          <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 mb-1.5">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#378ADD] transition"
              placeholder='*******@gmail.com'
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm text-gray-700 mb-1.5">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#378ADD] transition"
              placeholder='*******'
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-sm font-semibold text-white bg-[#185FA5] rounded-lg hover:opacity-90 transition mt-2"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Ainda não tem conta? <span className="text-[#185FA5] font-semibold">Criar conta</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
