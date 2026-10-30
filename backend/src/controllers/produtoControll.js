import { z } from 'zod';
import { buscarEmpresaIdPorUsuario, cadastrarProduto } from '../models/produtoModel.js';

// markup e margem NÃO entram aqui: o banco calcula sozinho (colunas geradas)
const schemaProduto = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  preco_compra: z.number().positive('O preço de compra precisa ser maior que zero'),
  preco_venda: z.number().positive('O preço de venda precisa ser maior que zero'),
  quantidade_estoque: z.number().int('A quantidade precisa ser um número inteiro').min(0, 'A quantidade não pode ser negativa'),
});

export const produtoCadastro = async (req, res) => {
  const resultado = schemaProduto.safeParse(req.body);

  if (!resultado.success) {
    return res.status(400).json({ erro: resultado.error.issues[0].message });
  }

  const dados = resultado.data;

  try {
    // req.usuario vem do verificarToken (o que foi colocado no jwt.sign: id e tipo)
    // A empresa SEMPRE vem do token, nunca do body, senão qualquer um cadastraria produto em nome de outra empresa
    const empresaId = await buscarEmpresaIdPorUsuario(req.usuario.id);

    if (!empresaId) {
      return res.status(403).json({ erro: 'Apenas contas de empresa podem cadastrar produtos.' });
    }

    const produtoId = await cadastrarProduto(
      empresaId,
      dados.nome,
      dados.preco_compra,
      dados.preco_venda,
      dados.quantidade_estoque
    );

    return res.status(201).json({ message: 'Produto cadastrado com sucesso!', produtoId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao cadastrar produto.' });
  }
};