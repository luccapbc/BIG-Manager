import db from '../config/db.js';
import bcrypt from 'bcrypt';


export async function verificarLogin(email, senha) {
    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]); // gera um array de objetos com os usuarios encontrados
    const user = users[0]; // pegando o primeiro usuario encontrado; a const user é um objeto, por isso podemos pegar propriedades dela usando user.exemplo; as propriedades sao suas pertencentes que foram chamadas no SELECT
    if (!user) return null;

    const senhaCorreta = await bcrypt.compare(senha, user.senha_hash)
    if(!senhaCorreta) return null;

    return user;
}



export async function cadastrarUsuario(nome, email, documento, senhaHash, tipo) { // a senha esta vindo com Hash direto do controller
  const conn = await db.getConnection(); // devemos usar isso para executar duas querys simultaneamente, onde uma depende da outra para ser feita

  try {
    await conn.beginTransaction(); // começa uma conexao (pool) com o banco; as duas querys fazem parte de uma unidade só


    const [resultadoUsuario] = await conn.query(
      'INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, tipo]
    );
    const usuarioId = resultadoUsuario.insertId; // propriedade exclusiva do mysql2 que puxa o id que foi inserido no insert, nao da para mudar.


    if (tipo === 'empresa') {
      await conn.query(
        'INSERT INTO empresa (usuario_id, cnpj) VALUES (?, ?)',
        [usuarioId, documento]
      );
    } else if (tipo === 'pessoa') {
      await conn.query(
        'INSERT INTO pessoa (usuario_id, cpf) VALUES (?, ?)',
        [usuarioId, documento]
      );
    }

    await conn.commit(); // isso faz com que as querys sejam executadas definitivamente, antes disso as querys não sao permanentes
    return usuarioId;

  } catch (error) {
    await conn.rollback(); // se alguma query der errado, ele desfaz todas as funções de banco feitas anteriormente
    throw error; // deixa o controller decidir como responder o erro
  } finally {
    conn.release(); // se as duas querys derem certo, ele devolve a conexao (pool), e ela passa a estar livre para outras requisiçoes
  }
}