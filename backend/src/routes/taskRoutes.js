const express = require('express');
const {
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
  updateTaskStatus
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All task routes require authentication

router.route('/')
  .post(authorize('Admin'), createTask);

router.route('/project/:projectId')
  .get(getProjectTasks);

router.route('/:id')
  .put(authorize('Admin'), updateTask)
  .delete(authorize('Admin'), deleteTask);

router.route('/:id/status')
  .patch(updateTaskStatus);

module.exports = router;
