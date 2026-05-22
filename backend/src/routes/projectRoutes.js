const express = require('express');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All project routes require authentication

router.route('/')
  .post(authorize('Admin'), createProject)
  .get(getProjects);

router.route('/:id')
  .get(getProject)
  .put(authorize('Admin'), updateProject)
  .delete(authorize('Admin'), deleteProject);

router.route('/:id/members')
  .post(authorize('Admin'), addProjectMember);

router.route('/:id/members/:userId')
  .delete(authorize('Admin'), removeProjectMember);

module.exports = router;
