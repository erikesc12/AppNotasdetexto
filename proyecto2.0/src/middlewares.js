const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Genera un token de acceso
const generateAccessToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = '1h';

  const token = jwt.sign({ userId }, secret, { expiresIn });
  return token;
};

// Verifica y decodifica el token de acceso
const verifyAccessToken = (token) => {
  const secret = process.env.JWT_SECRET;

  try {
    const decodedToken = jwt.verify(token, secret);
    return decodedToken;
  } catch (error) {
    throw new Error('Token de acceso inválido.');
  }
};

// Cifra una contraseña utilizando bcrypt
const hashPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

// Compara una contraseña con su versión cifrada utilizando bcrypt
const comparePassword = async (password, hashedPassword) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'No se proporcionó un token de acceso.' });
  }

  try {
    const decodedToken = verifyAccessToken(token);

    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token de acceso inválido.' });
  }
};

const handleError = (error, req, res, next) => {
  console.error(error);

  if (error instanceof SyntaxError) {
    res.status(400).json({ error: 'Solicitud JSON no válida.' });
  } else {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = {
  generateAccessToken,
  hashPassword,
  comparePassword,
  authenticateUser,
  handleError,
};