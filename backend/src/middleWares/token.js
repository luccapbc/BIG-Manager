import jwt from 'jsonwebtoken';

// Gera o token no login. Quem chama (o controller) decide o que fazer com ele.
export function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, tipo: usuario.tipo },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

// Protege rotas: exige o header "Authorization: Bearer <token>".
// Ainda não é usado, só entra quando você criar rotas protegidas (ex: /produtos).
export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET); // { id, tipo, iat, exp }
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}