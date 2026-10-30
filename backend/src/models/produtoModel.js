
import db from '../config/db.js';
 
// O token guarda o id do USUÁRIO, mas a tabela produtos aponta pra EMPRESA.
// Então primeiro descobrimos qual empresa pertence a esse usuário.
export async function buscarEmpresaIdPorUsuario(usuarioId) {
  const [linhas] = await db.query(
    'SELECT id FROM empresa WHERE usuario_id = ?',
    [usuarioId]
  );
  return linhas[0]?.id || null; // null = esse usuário não é uma empresa
}
 
// É uma query só, então não precisa de getConnection nem de transação
export async function cadastrarProduto(empresaId, nome, precoCompra, precoVenda, quantidadeEstoque) {
  const [resultado] = await db.query(
    `INSERT INTO produtos (empresa_id, nome, preco_compra, preco_venda, quantidade_estoque)
     VALUES (?, ?, ?, ?, ?)`,
    [empresaId, nome, precoCompra, precoVenda, quantidadeEstoque]
  );
  return resultado.insertId; // id do produto criado
}