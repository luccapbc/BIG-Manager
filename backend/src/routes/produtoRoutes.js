import { Router } from 'express';
import { produtoCadastro } from '../controllers/produtoControll.js';
import { verificarToken } from '../middleWares/token.js'; // ajuste se o nome da sua pasta for outro

const router = Router();

// verificarToken roda ANTES do controller: sem token válido, nem chega nele
router.post('/', verificarToken, produtoCadastro); // POST /produtos

export default router;