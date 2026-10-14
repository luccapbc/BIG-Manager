import { useState } from 'react';

export default function CadastroProduto() {
  const [nome, setNome] = useState('');
  const [precoCompra, setPrecoCompra] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Converte o texto do input em número (aceita vírgula também)
  const compra = parseFloat(String(precoCompra).replace(',', '.'));
  const venda = parseFloat(String(precoVenda).replace(',', '.'));

  // Mesmas fórmulas que o banco usa nas colunas geradas:
  // markup = (venda - compra) / compra   |   margem = (venda - compra) / venda
  const markup = compra > 0 && !isNaN(venda) ? ((venda - compra) / compra) * 100 : null;
  const margem = venda > 0 && !isNaN(compra) ? ((venda - compra) / venda) * 100 : null;

  const formatar = (valor) =>
    valor === null ? '—' : `${valor.toFixed(2).replace('.', ',')}%`;

  // Fica vermelho quando o produto dá prejuízo (venda abaixo da compra)
  const corValor = (valor) => (valor !== null && valor < 0 ? 'text-red-600' : 'text-gray-900');

  function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!nome.trim()) {
      setErro('Informe o nome do produto.');
      return;
    }

    if (isNaN(compra) || isNaN(venda) || compra < 0 || venda < 0) {
      setErro('Informe preços válidos (zero ou maior).');
      return;
    }

    // Markup e margem NÃO vão pro back: o banco calcula sozinho (colunas geradas)
    const produto = {
      nome: nome.trim(),
      preco_compra: compra,
      preco_venda: venda,
    };

    // TODO: aqui entra a chamada pro back-end (POST /produtos) quando a rota existir.
    console.log('Produto enviado:', produto);

    setSucesso('Produto cadastrado!');
    setNome('');
    setPrecoCompra('');
    setPrecoVenda('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-xl p-8">

        <h1 className="text-xl font-medium mb-1">
          <span className="text-[#185FA5]">BigManager</span>
        </h1>
        <p className="text-sm text-gray-500 mb-7">Cadastre um novo produto.</p>

        {erro && (
          <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg mb-4">
            {sucesso}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm text-gray-700 mb-1.5">
              Nome do produto
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#378ADD] transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="precoCompra" className="block text-sm text-gray-700 mb-1.5">
                Preço de compra
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  R$
                </span>
                <input
                  id="precoCompra"
                  type="number"
                  min="0"
                  step="0.01"
                  value={precoCompra}
                  onChange={(e) => setPrecoCompra(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#378ADD] transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="precoVenda" className="block text-sm text-gray-700 mb-1.5">
                Preço de venda
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  R$
                </span>
                <input
                  id="precoVenda"
                  type="number"
                  min="0"
                  step="0.01"
                  value={precoVenda}
                  onChange={(e) => setPrecoVenda(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#378ADD] transition"
                />
              </div>
            </div>
          </div>

          {/* Calculados em tempo real, não são digitados */}
          {/*<div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Markup</p>
              <p className={`text-lg font-semibold ${corValor(markup)}`}>{formatar(markup)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Margem de lucro</p>
              <p className={`text-lg font-semibold ${corValor(margem)}`}>{formatar(margem)}</p>
            </div>
          </div>*/}

          <button
            type="submit"
            className="w-full py-2.5 text-sm font-semibold text-white bg-[#185FA5] rounded-lg hover:opacity-90 transition mt-2"
          >
            Cadastrar produto
          </button>
        </form>
      </div>
    </div>
  );
}