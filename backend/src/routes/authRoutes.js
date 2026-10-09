import { Router } from 'express';
import { authCadastro, authLogin } from '../controllers/authControll.js';

const router = Router();

// Aqui só definimos "qual URL chama qual função", sem lógica nenhuma
router.post('/register', authCadastro); // POST /auth/register
router.post('/login', authLogin);       // POST /auth/login

export default router;