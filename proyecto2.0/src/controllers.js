const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

// Controlador para el registro de usuarios
const registerUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Verifica si el usuario ya está registrado
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'El usuario ya está registrado.' });
      }
  
      // Cifra la contraseña antes de guardarla en la base de datos
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Crea un nuevo usuario en la base de datos
      const newUser = await db.createUser(email, hashedPassword);
  
      // Retorna la respuesta con el usuario creado
      return res.status(201).json({ user: newUser });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  };
  

// Controlador para el inicio de sesión de usuarios
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verifica si el usuario existe en la base de datos
    const existingUser = await db.getUserByEmail(email);
    if (!existingUser) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Compara la contraseña ingresada con la contraseña almacenada en la base de datos
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Genera un token de acceso para el usuario
    const accessToken = generateAccessToken(existingUser.id);

    // Retorna la respuesta con el token de acceso
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Controlador para crear una nota
const createNote = async (req, res) => {
  try {
    const { title, text, category } = req.body;

    // Obtiene el ID del usuario desde la solicitud
    const userId = req.userId;

    // Crea la nota en la base de datos
    const newNote = await db.createNote(userId, title, text, category);

    // Retorna la respuesta con la nueva nota creada
    return res.status(201).json({ note: newNote });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Controlador para obtener el listado de notas de un usuario
const getNotes = async (req, res) => {
  try {
    // Obtiene el ID del usuario desde la solicitud
    const userId = req.userId;

    // Obtiene el listado de notas del usuario desde la base de datos
    const notes = await db.getNotesByUserId(userId);

    // Retorna la respuesta con el listado de notas
    return res.status(200).json({ notes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Controlador para actualizar una nota
const updateNote = async (req, res) => {
  try {
    const { noteId, title, text, category } = req.body;

    // Obtiene el ID del usuario desde la solicitud
    const userId = req.userId;

    // Verifica si la nota pertenece al usuario actual
    const note = await db.getNoteById(noteId);
    if (!note || note.userId !== userId) {
      return res.status(404).json({ error: 'Nota no encontrada.' });
    }

    // Actualiza la nota en la base de datos
    const updatedNote = await db.updateNote(noteId, title, text, category);

    // Retorna la respuesta con la nota actualizada
    return res.status(200).json({ note: updatedNote });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Controlador para eliminar una nota
const deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;

    // Obtiene el ID del usuario desde la solicitud
    const userId = req.userId;

    // Verifica si la nota pertenece al usuario actual
    const note = await db.getNoteById(noteId);
    if (!note || note.userId !== userId) {
      return res.status(404).json({ error: 'Nota no encontrada.' });
    }

    // Elimina la nota de la base de datos
    await db.deleteNoteById(noteId);

    // Retorna la respuesta indicando que la nota ha sido eliminada
    return res.status(200).json({ message: 'Nota eliminada correctamente.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
  // Controlador para crear una categoría
    const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Crea la categoría en la base de datos
    const newCategory = await db.createCategory(name);

    // Retorna la respuesta con la nueva categoría creada
    return res.status(201).json({ category: newCategory });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Controlador para obtener una categoría
const getCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Obtiene la categoría desde la base de datos
    const category = await db.getCategory(categoryId);

    // Verifica si la categoría existe
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }

    // Retorna la respuesta con la categoría
    return res.status(200).json({ category });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Controlador para actualizar una categoría
const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name } = req.body;

    // Actualiza la categoría en la base de datos
    const updatedCategory = await db.updateCategory(categoryId, name);

    // Verifica si la categoría existe
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }

    // Retorna la respuesta con la categoría actualizada
    return res.status(200).json({ category: updatedCategory });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Controlador para eliminar una categoría
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Elimina la categoría de la base de datos
    const deletedCategory = await db.deleteCategory(categoryId);

    // Verifica si la categoría existe
    if (!deletedCategory) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }

    // Retorna la respuesta indicando que la categoría ha sido eliminada
    return res.status(200).json({ message: 'Categoría eliminada correctamente.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};
