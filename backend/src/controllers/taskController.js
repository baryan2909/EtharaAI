const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { sendTaskAssignmentEmail } = require('../utils/emailService');

/**
 * @desc    Create new task
 * @route   POST /api/tasks
 * @access  Private/Admin
 */
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ success: false, error: 'Task title and project ID are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Only project Admin (creator) can create tasks
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Only the project creator can create tasks' });
    }

    // If assignedTo is provided, verify that the assignee is a member of the project
    if (assignedTo && !project.members.includes(assignedTo)) {
      return res.status(400).json({ success: false, error: 'Assignee must be a member of the project' });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status: status || 'Pending',
      assignedTo: assignedTo || null,
      projectId,
      createdBy: req.user._id
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role avatar')
      .populate('createdBy', 'name email role');

    // 1. Broadcast Socket.io Event for live update
    const io = req.app.get('io');
    if (io) {
      io.to(projectId.toString()).emit('task:created', populatedTask);
      console.log(`Socket broadcast: task:created for project ${projectId}`);
    }

    // 2. Dispatch background email notification if assigned to a member
    if (assignedTo && populatedTask.assignedTo) {
      try {
        await sendTaskAssignmentEmail(
          populatedTask.assignedTo.email,
          populatedTask.assignedTo.name,
          populatedTask.title,
          project.name,
          populatedTask.dueDate
        );
      } catch (emailErr) {
        console.error('Task assignment email notification failed to send:', emailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tasks for a project
 * @route   GET /api/tasks/project/:projectId
 * @access  Private
 */
exports.getProjectTasks = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Verify user is member or creator
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isMember = project.members.includes(req.user._id);

    if (!isCreator && !isMember) {
      return res.status(403).json({ success: false, error: 'Not authorized to view tasks in this project' });
    }

    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignedTo', 'name email role avatar')
      .populate('createdBy', 'name email role')
      .sort('dueDate');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task details
 * @route   PUT /api/tasks/:id
 * @access  Private/Admin
 */
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Associated project not found' });
    }

    // Only project Admin (creator) can edit task details
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Only the project creator can edit task details' });
    }

    // If assigning to a new user, verify they are a member of the project
    const { assignedTo } = req.body;
    const previousAssignee = task.assignedTo ? task.assignedTo.toString() : null;

    if (assignedTo && !project.members.includes(assignedTo)) {
      return res.status(400).json({ success: false, error: 'Assignee must be a member of the project' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    .populate('assignedTo', 'name email role avatar')
    .populate('createdBy', 'name email role');

    // 1. Broadcast Socket.io Event for live update
    const io = req.app.get('io');
    if (io) {
      io.to(task.projectId.toString()).emit('task:updated', task);
      console.log(`Socket broadcast: task:updated for project ${task.projectId}`);
    }

    // 2. Dispatch background email notification if newly assigned or reassigned
    if (assignedTo && assignedTo !== previousAssignee && task.assignedTo) {
      try {
        await sendTaskAssignmentEmail(
          task.assignedTo.email,
          task.assignedTo.name,
          task.title,
          project.name,
          task.dueDate
        );
      } catch (emailErr) {
        console.error('Reassigned task email notification failed to send:', emailErr.message);
      }
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private/Admin
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Associated project not found' });
    }

    // Only project Admin (creator) can delete tasks
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Only the project creator can delete tasks' });
    }

    const projectId = task.projectId;
    const taskId = task._id;

    await Task.findByIdAndDelete(req.params.id);

    // Broadcast Socket.io Event for live deletion
    const io = req.app.get('io');
    if (io) {
      io.to(projectId.toString()).emit('task:deleted', { taskId, projectId });
      console.log(`Socket broadcast: task:deleted for project ${projectId}`);
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task status only (Member and Admin)
 * @route   PATCH /api/tasks/:id/status
 * @access  Private
 */
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid status: Pending, In Progress, Completed' });
    }

    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Associated project not found' });
    }

    // Verify user has access to this project (is creator or member)
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isMember = project.members.includes(req.user._id);

    if (!isCreator && !isMember) {
      return res.status(403).json({ success: false, error: 'Not authorized to access tasks in this project' });
    }

    task.status = status;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role avatar')
      .populate('createdBy', 'name email role');

    // Broadcast Socket.io Event for live status change
    const io = req.app.get('io');
    if (io) {
      io.to(task.projectId.toString()).emit('task:status_changed', populatedTask);
      console.log(`Socket broadcast: task:status_changed for project ${task.projectId}`);
    }

    res.status(200).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    next(error);
  }
};
