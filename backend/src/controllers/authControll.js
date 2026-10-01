const db = require('../config/db')
import z from 'zod';
import { z } from 'zod';
import {authCadastro} from ('../models/authModel') // exportar as funções
import bcrypt from 'bcrypt'

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
    senha: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres'),
})



export const authCadastro = async (req, res) => {
  const resultado = schemaCadastro.safeParse(req.body);

  if (!resultado.success) {
    return res.status(400).json({ erro: resultado.error.issues[0].message });
  }

  const dados = resultado.data;

  try {
      const senhaHash = await bcrypt.hash(dados.senha, SALT_ROUNDS);

    if (dados.tipo === 'empresa') {
        await registrarEmpresa(dados.nome,dados.email,senhaHash,dados.cnpj);
        return res.status(201).json({ message: "Registrado com sucesso!" });

    }else if (dados.tipo === 'pessoa') {
        await registrarPessoa(dados.nome,dados.email,senhaHash,dados.cpf);
        return res.status(201).json({ message: "Registrado com sucesso!" });

    } 
  } catch (error) {
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
        const usuario = await buscarUsuarioPorEmail(dados.email); // função do seu model

        if (!usuario) {
          return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
        }

        const senhaConfere = await bcrypt.compare(dados.senha, usuario.senha_hash);

        if (!senhaConfere) {
            return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
        }

        // senha certa, segue pra gerar o token JWT
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao fazer login.' });
    }
}