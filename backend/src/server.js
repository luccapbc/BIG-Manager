import 'dotenv/config'; // carrega o .env antes de qualquer outra coisa
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // sem isso, req.body chega undefined

// Todas as rotas do authRoutes ganham o prefixo /auth
app.use('/auth', authRoutes);



app.listen(PORT, () => {
  console.log(` Servidor rodando em http://localhost:${PORT}`);
});