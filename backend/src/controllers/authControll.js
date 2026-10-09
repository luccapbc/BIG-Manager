import { z } from 'zod';
import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
import { cadastrarUsuario, verificarLogin } from '../models/authModel.js'; // exportar as funções
import { cpfEhValido, cnpjEhValido } from '../utils/validadores.js';
import { gerarToken } from '../middleware/token.js';

const SALT_ROUNDS = 10 // o quao seguro a Hash vai ser

const schemaEmpresa = z.object({
  tipo: z.literal('empresa'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres'),
  cnpj: z.string().refine(cnpjEhValido, { message: 'CNPJ inválido' }),
});

const schemaPessoa = z.object({
  tipo: z.literal('pessoa'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres'),
  cpf: z.string().refine(cpfEhValido, { message: 'CPF inválido' }),
});

const schemaCadastro = z.discriminatedUnion('tipo', [
  schemaEmpresa,
  schemaPessoa,
]);

const schemaLogin = z.object({
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(1, 'Senha é obrigatória'),
})



export const authCadastro = async (req, res) => {
  const resultado = schemaCadastro.safeParse(req.body);

  if (!resultado.success) {
    return res.status(400).json({ erro: resultado.error.issues[0].message });
  }

  const dados = resultado.data;
  const documento = dados.tipo === 'empresa' ? dados.cnpj : dados.cpf;

  try {
      const senhaHash = await bcrypt.hash(dados.senha, SALT_ROUNDS);

      const usuarioId = await cadastrarUsuario(
        dados.nome,
        dados.email,
        documento,
        senhaHash,
        dados.tipo
      );

      return res.status(201).json({ message: "Registrado com sucesso!", usuarioId });

  } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ erro: 'E-mail, CNPJ ou CPF já cadastrado.' });
      }
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao registrar usuário.' });
  }


  //console.log(dados); DEBUG
};


export const authLogin = async(req, res) => {
    const resultado = schemaLogin.safeParse(req.body);



    if(!resultado.success){
       return res.status(400).json({ erro: resultado.error.issues[0].message });
    }

    const dados = resultado.data

    try {
        const usuario = await verificarLogin(dados.email, dados.senha); // função do seu model

        if (!usuario) {
          return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
        }

        // gerar o token JWT
        const token = gerarToken(usuario);
              
        return res.status(200).json({
          token,
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo,
          },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao fazer login.' });
    }
}