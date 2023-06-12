const express = require('express');
const app = express();
const routes = require('./routes.js');
const middlewares = require('./middlewares.js');

// Configuración de middlewares
app.use(express.json()); // Para analizar los datos en formato JSON de las solicitudes
app.use(middlewares.authenticateUser);

// Configuración de rutas
app.use('/', routes);

// Manejo de errores
app.use(middlewares.handleError);

// Inicio del servidor
const port = process.env.PORT || 3000;

app.listen(3000, () => {
  console.log(`Servidor iniciado en el puerto 3000`);
});

const registerUserNoAuth = (req, res) => {
  const { username, password } = req.body;

  // Validar los datos recibidos
  if (!username || !password) {
    return res.status(400).json({ error: 'Se requiere un nombre de usuario y una contraseña.' });
  }