import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config.js';

// Os 4 campos de preço: o usuário preenche UM, os outros são calculados
const CAMPOS = [
  { chave: 'venda', rotulo: 'Preço de venda', prefixo: 'R$' },
  { chave: 'custo', rotulo: 'Custo sobre a venda', sufixo: '%' },
  { chave: 'markup', rotulo: 'Markup', sufixo: '%' },
  { chave: 'margem', rotulo: 'Margem de lucro', sufixo: '%' },
];

// Aceita vírgula e ponto; texto vazio vira NaN
const numero = (texto) => parseFloat(String(texto).replace(',', '.'));

export default function CadastroProduto() {
  const [nome, setNome] = useState('');
  const [precoCompra, setPrecoCompra] = useState('');
  const [quantidadeEstoque, setQuantidadeEstoque] = useState('');

  // campoAtivo = qual dos 4 o usuário está usando; valorAtivo = o que ele digitou lá
  const [campoAtivo, setCampoAtivo] = useState(null);
  const [valorAtivo, setValorAtivo] = useState('');

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const compra = numero(precoCompra);
  const quantidade = parseInt(quantidadeEstoque, 10);
  const digitado = numero(valorAtivo);

  // 1) A partir do campo preenchido, descobre o PREÇO DE VENDA final
  function calcularVenda() {
    if (!(compra > 0) || campoAtivo === null || isNaN(digitado)) return null;

    let v = NaN;
    if (campoAtivo === 'venda') v = digitado;
    if (campoAtivo === 'custo') v = digitado > 0 ? compra / (digitado / 100) : NaN;
    if (campoAtivo === 'markup') v = compra * (1 + digitado / 100);
    if (campoAtivo === 'margem') v = digitado < 100 ? compra / (1 - digitado / 100) : NaN;

    if (!isFinite(v) || v <= 0) return null;
    return Math.round(v * 100) / 100; // dinheiro em centavos
  }

  const venda = calcularVenda();

  // 2) A partir do preço de venda final, calcula os outros campos
  const calculados = {
    venda,
    custo: venda ? (compra / venda) * 100 : null,
    markup: venda ? ((venda - compra) / compra) * 100 : null,
    margem: venda ? ((venda - compra) / venda) * 100 : null,
  };

  // Campo ativo mostra o que a pessoa digitou; os outros mostram o valor calculado
  function valorExibido(chave) {
    if (chave === campoAtivo) return valorAtivo;
    return calculados[chave] === null ? '' : calculados[chave].toFixed(2);
  }

  // Vermelho quando o produto dá prejuízo
  function corTexto(chave) {
    const v = calculados[chave];
    if (v === null) return 'text-gray-900';
    if (chave === 'custo') return v > 100 ? 'text-red-600' : 'text-gray-900';
    if (chave === 'markup' || chave === 'margem') return v < 0 ? 'text-red-600' : 'text-gray-900';
    return 'text-gray-900';
  }

 async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!nome.trim()) {
      setErro('Informe o nome do produto.');
      return;
    }
    if (!(compra > 0)) {
      setErro('Informe um preço de compra maior que zero.');
      return;
    }
    if (isNaN(quantidade) || quantidade < 0) {
      setErro('Informe uma quantidade em estoque válida (zero ou maior).');
      return;
    }
    if (campoAtivo === null || valorAtivo === '') {
      setErro('Preencha um dos campos: preço de venda, custo sobre a venda, markup ou margem.');
      return;
    }
    if (campoAtivo === 'margem' && digitado >= 100) {
      setErro('A margem de lucro precisa ser menor que 100%.');
      return;
    }
    if (campoAtivo === 'custo' && !(digitado > 0)) {
      setErro('O custo sobre a venda precisa ser maior que 0%.');
      return;
    }
    if (venda === null) {
      setErro('Valor inválido: o preço de venda resultante precisa ser maior que zero.');
      return;
    }

    // Só estes 4 vão pro back: o banco calcula markup e margem sozinho
    const produto = {
      nome: nome.trim(),
      preco_compra: compra,
      quantidade_estoque: quantidade,
      preco_venda: venda,
    };

    try {
    await axios.post(`${API_URL}/produtos`, produto, {
    headers: { Authorization: `Bearer ${localStorage.getItem('bigmanager_token')}` },
    });

    setSucesso('Produto cadastrado!');
    setNome('');
    setPrecoCompra('');
    setQuantidadeEstoque('');
    setCampoAtivo(null);
    setValorAtivo('');
}   catch (err) {
    setErro(err.response?.data?.erro || 'Não foi possível conectar ao servidor.');
}
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

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Dados obrigatórios */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-full">
              <label htmlFor="nome" className="flex text-sm text-gray-700 mb-1.5">
                Nome do produto
                <span className='pl-1 text-red-700'>*</span>
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
              <label htmlFor="precoCompra" className="flex text-sm text-gray-700 mb-1.5">
                Preço de compra / produção
                 <span className='pl-1 text-red-700'>*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  R$
                </span>
                <input
                  id="precoCompra"
                  type="number"
                  min="0"
                  step="any"
                  value={precoCompra}
                  onChange={(e) => setPrecoCompra(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#378ADD] transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="quantidadeEstoque" className="flex text-sm text-gray-700 mb-1.5">
                Quantidade em estoque
                <span className='pl-1 text-red-700'>*</span>
              </label>
              <input
                id="quantidadeEstoque"
                type="number"
                min="0"
                step="1"
                value={quantidadeEstoque}
                onChange={(e) => setQuantidadeEstoque(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#378ADD] transition"
              />
            </div>
          </div>

    
      
        
            <div className="border-t border-gray-200 pt-5">

              {/*<p className="text-sm text-gray-500 mb-4">
                Preencha apenas um dos campos abaixo. Os outros três são calculados automaticamente.
              </p>*/}

            <div className="grid grid-cols-2 gap-4">
              {CAMPOS.map((campo) => {
                const ativo = campoAtivo === campo.chave;
                return (
                  <div key={campo.chave}>
                    <label
                      htmlFor={campo.chave}
                      className="flex text-sm text-gray-700 mb-1.5"
                    >
                      {campo.rotulo}
                       <span className='pl-1 text-amber-500'>*</span>
                    </label>
                    <div className="relative">
                      {campo.prefixo && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          {campo.prefixo}
                        </span>
                      )}
                      <input
                        id={campo.chave}
                        type="number"
                        step="any"
                        value={valorExibido(campo.chave)}
                        onFocus={(e) => e.target.select()} // digitar já substitui o valor calculado
                        onChange={(e) => {
                          setCampoAtivo(campo.chave);
                          setValorAtivo(e.target.value);
                        }}
                        className={`w-full py-2.5 text-sm border rounded-lg outline-none transition ${
                          campo.prefixo ? 'pl-9 pr-3' : 'pl-3 pr-8'
                        } ${
                          ativo
                            ? 'border-[#378ADD] bg-white'
                            : 'border-gray-200 bg-gray-50 focus:border-[#378ADD] focus:bg-white'
                        } ${ativo ? 'text-gray-900' : corTexto(campo.chave)}`}
                      />
                      {campo.sufixo && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          {campo.sufixo}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-sm font-semibold text-white bg-[#185FA5] rounded-lg hover:opacity-90 transition"
          >
            Cadastrar produto
          </button>
        </form>
      </div>
    </div>
  );
}