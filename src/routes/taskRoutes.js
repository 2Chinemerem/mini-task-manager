const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask, getAllTasks, deleteAnyTask } = require('../controllers/taskControllers');

router.use(authenticate);

router.post('/tasks', authenticate, createTask);
router.get('/tasks', authenticate, getTasks);
router.get('/tasks/all', authenticate, authorize('admin'), getAllTasks);
router.put('/tasks/:id', authenticate, updateTask);
router.delete('/tasks/:id', authenticate, deleteTask);
router.delete('/tasks/:id/force', authenticate, authorize('admin'), deleteAnyTask);

module.exports = router;