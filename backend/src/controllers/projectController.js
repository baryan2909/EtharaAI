const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id] // Creator is automatically added as a member
    });

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');

    res.status(201).json({
      success: true,
      data: populatedProject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for logged-in user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    // Return projects where user is either creator or a member
    const projects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('createdBy', 'name email role')
    .populate('members', 'name email role')
    .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project details
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Verify user has access to this project (is creator or member)
    const isCreator = project.createdBy._id.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());

    if (!isCreator && !isMember) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this project' });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Only project creator (who is Admin) can edit project details
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Only the project creator can edit project details' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'name email role').populate('members', 'name email role');

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Only project creator (who is Admin) can delete project
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Only the project creator can delete this project' });
    }

    // Delete all associated tasks first
    await Task.deleteMany({ projectId: req.params.id });

    // Delete project
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project by email
// @route   POST /api/projects/:id/members
// @access  Private/Admin
exports.addProjectMember = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide member email' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Only project creator (who is Admin) can add members
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Only the project creator can add members' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'No user registered with this email address' });
    }

    // Check if user is already a member
    if (project.members.includes(user._id)) {
      return res.status(400).json({ success: false, error: 'User is already a member of this project' });
    }

    // Add user to project members
    project.members.push(user._id);
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');

    res.status(200).json({
      success: true,
      data: populatedProject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private/Admin
exports.removeProjectMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Only project creator (who is Admin) can remove members
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Only the project creator can remove members' });
    }

    const userIdToRemove = req.params.userId;

    // Prevent creator from removing themselves
    if (project.createdBy.toString() === userIdToRemove) {
      return res.status(400).json({ success: false, error: 'You cannot remove yourself (the creator) from the project' });
    }

    // Check if user is a member
    if (!project.members.includes(userIdToRemove)) {
      return res.status(400).json({ success: false, error: 'User is not a member of this project' });
    }

    // Pull from members list
    project.members = project.members.filter(m => m.toString() !== userIdToRemove);
    await project.save();

    // Re-assign all tasks currently assigned to this user to unassigned (or null)
    await Task.updateMany(
      { projectId: req.params.id, assignedTo: userIdToRemove },
      { $unset: { assignedTo: 1 } }
    );

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');

    res.status(200).json({
      success: true,
      data: populatedProject
    });
  } catch (error) {
    next(error);
  }
};
