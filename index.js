const mysql = require("mysql");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./database"); // importar el módulo de base de datos que estés utilizando

app.use(express.json());

//conexion con mysql
const conexion = mysql.createConnection({
  host: "localhost",
  database: "notasdetexto",
  user: "root",
  password: "",
});

conexion.connect(function (error) {
  if (error) {
    throw error;
  } else {
    console.log("conexion exitosa");
  }
});
conexion.end();

// Modelo de datos para los usuarios
const User = {
  id: Number,
  email: String,
  password: String,
  createdAt: Date,
  updatedAt: Date,
};

// Modelo de datos para las notas
const Note = {
  id: Number,
  userId: Number,
  title: String,
  text: String,
  category: String,
  public: Boolean,
  image: String,
  createdAt: Date,
  updatedAt: Date,
};
// Rutas de autenticación
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  // Validar que se hayan proporcionado email y contraseña
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email y contraseña son requeridos" });
  }

  try {
    // Verificar si el usuario ya existe en la base de datos
    const user = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (user.length) {
      return res
        .status(409)
        .json({ message: "Este email ya ha sido registrado" });
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

    app.post("/api/notes", authenticate, async (req, res) => {
      const { title, text, category, public, image } = req.body;

      // Validar que se hayan proporcionado título y texto
      if (!title || !text) {
        return res
          .status(400)
          .json({ message: "Título y texto son requeridos" });
      }

      try {
        // Insertar la nota en la base de datos
        await db.query(
          "INSERT INTO notes (userId, title, text, category, public, image) VALUES (?, ?, ?, ?, ?, ?)",
          [req.user.id, title, text, category, public, image]
        );

        return res.status(201).json({ message: "Nota creada exitosamente" });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error interno del servidor" });
      }
    });
    // Comparar la contraseña proporcionada con el hash almacenado en la base de datos
    const match = await bcrypt.compare(password, user[0].password);

    if (!match) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar un token de acceso
    const token = jwt.sign({ userId: user[0].id }, "secreto");

    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Rutas de notas
app.get("/api/notes", async (req, res) => {
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

  // Rutas de notas
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
  return res.json(note[0]); // Devolver la nota encontrada como objeto en lugar de un arreglo
});
