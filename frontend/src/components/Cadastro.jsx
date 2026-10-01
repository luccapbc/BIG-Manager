import { useState } from 'react';


function Cadastro() {
  const [tipo, setTipo] = useState('empresa');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [documento, setDocumento] = useState(''); // cnpj ou cpf, dependendo do tipo
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    if (!nome || !email || !documento || !senha) {
      setErro('Preencha todos os campos.');
      return;
    }

    setErro('');
    // A chamada pro back-end (criar a conta de verdade) entra aqui depois.
    console.log('Cadastro enviado:', { tipo, nome, email, documento, senha });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-8 shadow-[0_0_15px_5px] shadow-gray-300/80 trasnsition duration-300 hover:shadow-[0_0_15px_5px] hover:shadow-[#185FA5]/45">

        <h1 className="text-xl font-medium mb-1 text-center">
          <span className="text-[#185FA5] ">BigManager</span>
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Crie sua conta para começar.
        </p>

        

        {/* Toggle empresa / pessoa */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-5">
          <button
            type="button"
            onClick={() => { setTipo('empresa'); setDocumento(''); }}
            className={`flex-1 py-2.5 text-sm transition cursor-pointer
                ${
                    tipo === 'empresa'
                    ? 'bg-blue-50 text-[#185FA5] font-semibold'
                    : 'bg-white text-gray-500'
                }`}
          >
            Empresa
          </button>
          <button
            type="button"
            onClick={() => { setTipo('pessoa'); setDocumento(''); }}
            className={`flex-1 py-2.5 text-sm transitio cursor-pointer 
              ${
              tipo === 'pessoa'
                ? 'bg-blue-50 text-[#185FA5] font-semibold'
                : 'bg-white text-gray-500'
            }`}
          >
            Pessoa Física
          </button>
        </div>

        <form 
            onSubmit={handleSubmit} 
            className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm text-gray-700 mb-1.5">
              Nome
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#378ADD] transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 mb-1.5">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // e assim que eu pego o que o usuario esta digitando para mandar para o usestate
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#378ADD] transition"
              placeholder='*******@gmail.com'
            />
          </div>

          <div>
            <label htmlFor="documento" className="block text-sm text-gray-700 mb-1.5">
              {tipo === 'empresa' ? 'CNPJ' : 'CPF'}
            </label>
            <input
              id="documento"
              type="text"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              placeholder={tipo === 'empresa' ? '00.000.000/0000-00' : '000.000.000-00'}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#378ADD] transition"
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

          {erro && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">
            {erro}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 text-sm font-semibold text-white bg-[#185FA5] rounded-lg hover:opacity-90 transition mt-2"
          >
            Criar conta
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Já tem uma conta? <span className="text-[#185FA5] font-semibold">Entrar</span>
        </p>
      </div>
    </div>
  );
}

export default Cadastro;