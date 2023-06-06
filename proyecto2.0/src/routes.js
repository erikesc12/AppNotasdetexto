const express = require('express');
const router = express.Router();
const { authenticateUser } = require('./middlewares');
const controllers = require('./controllers');

router.post('/register', controllers.registerUser);
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
