const express = require('express');
const router = express.Router();
const { authenticateUser } = require('./middlewares');
const controllers = require('./controllers');
const jwt = require('jsonwebtoken');

// Ruta para generar un token de acceso
router.post('/generate-token', (req, res) => {
  const { userId } = req.body; // Suponiendo que se recibe el userId en el cuerpo de la solicitud

  const secret = process.env.JWT_SECRET;
  const expiresIn = '1h';

  const token = jwt.sign({ userId }, secret, { expiresIn });

  res.json({ token }); // Devolver el token generado en la respuesta
});

router.post('/register',authenticateUser, controllers.registerUser);
router.post('/login', controllers.loginUser);
router.post('/notes', authenticateUser, controllers.createNote);
router.get('/notes', authenticateUser, controllers.getNotes);
router.put('/notes/:id', authenticateUser, controllers.updateNote);
router.delete('/notes/:id', authenticateUser, controllers.deleteNote);
router.post('/categories', authenticateUser, controllers.createCategory);
router.get('/categories/:id', authenticateUser, controllers.getCategory);
router.put('/categories/:id', authenticateUser, controllers.updateCategory);
router.delete('/categories/:id', authenticateUser, controllers.deleteCategory);

module.exports = router;
