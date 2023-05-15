const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("mysql");

const app = express();

app.use(express.json());

// Conexion con mysql
const conexion = db.createConnection({
  host: "localhost",
  database: "notasdetexto",
  user: "root",
  password: "1234",
});

conexion.connect(function (error) {
  if (error) {
    throw error;
  } else {
    console.log("Conexion exitosa");
  }
});

// Modelo de datos para los usuarios
const User = {
  id: "INT UNSIGNED AUTO_INCREMENT PRIMARY KEY",
  email: "VARCHAR(255) NOT NULL",
  password: "VARCHAR(255) NOT NULL",
  createdAt: "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
  updatedAt:
    "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
};

// Modelo de datos para las notas
const Note = {
  id: "INT UNSIGNED AUTO_INCREMENT PRIMARY KEY",
  userId: "INT UNSIGNED NOT NULL",
  title: "VARCHAR(255) NOT NULL",
  text: "TEXT NOT NULL",
  category: "VARCHAR(255) NOT NULL",
  public: "BOOLEAN NOT NULL DEFAULT FALSE",
  image: "VARCHAR(255)",
  createdAt: "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
  updatedAt:
    "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
};

// Rutas de autenticación
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  // Validar que se hayan proporcionado email y contraseña
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email y contraseña son requeridos" });
  }

  try {
    // Verificar si el usuario ya existe en la base de datos
    const user = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (user.length) {
      return res
        .status(409)
        .json({ success: false, message: "Este email ya ha sido registrado" });
    }

    // Generar un hash de la contraseña
    const hash = await bcrypt.hash(password, 10);

    // Insertar el usuario en la base de datos
    await db.query("INSERT INTO users (email, password) VALUES (?, ?)", [
      email,
      hash,
    ]);

    return res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // Validar que se hayan proporcionado email y contraseña
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email y contraseña son requeridos" });
  }

  try {
    // Verificar si el usuario existe en la base de datos
    const user = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (!user.length) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    //

    // Generar un token de acceso
    const token = jwt.sign({ userId: user[0].id }, "secreto");

    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Rutas de notas

// Middleware de autenticación
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Token de acceso no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "secreto");
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: "Token de acceso inválido" });
  }
};

app.get("/api/notes", authenticate, async (req, res) => {
  // Obtener todas las notas del usuario autenticado
  const notes = await db.query("SELECT * FROM notes WHERE userId = ?", [
    req.user.id,
  ]);

  return res.json(notes);
});

app.get("/api/notes/:id", authenticate, async (req, res) => {
  // Obtener una nota específica del usuario autenticado
  const note = await db.query(
    "SELECT * FROM notes WHERE userId = ? AND id = ?",
    [req.user.id, req.params.id]
  );

  if (!note.length) {
    return res.status(404).json({ message: "La nota no fue encontrada" });
  }

  return res.json(note[0]);
});
