const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

/**
 * @desc    Get dashboard statistics for user
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    // 1. Find all projects user has access to (creator or member)
    const projects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    }).populate('createdBy', 'name email').populate('members', 'name email');

    const projectIds = projects.map(p => p._id);

    // 2. Find all tasks in these projects
    const tasks = await Task.find({ projectId: { $in: projectIds } })
      .populate('assignedTo', 'name email role avatar')
      .populate('projectId', 'name')
      .sort('-createdAt');

    // 3. Aggregate overall tasks by status (Pending, In Progress, Completed)
    const stats = {
      pending: 0,
      inProgress: 0,
      completed: 0
    };

    tasks.forEach(task => {
      if (task.status === 'Pending') stats.pending++;
      else if (task.status === 'In Progress') stats.inProgress++;
      else if (task.status === 'Completed') stats.completed++;
    });

    const totalTasks = tasks.length;

    // 4. Overdue tasks (status is not Completed, and dueDate is before now)
    const now = new Date();
    const overdueTasks = tasks.filter(task => {
      return task.status !== 'Completed' && task.dueDate && new Date(task.dueDate) < now;
    });

    // 5. Tasks per user (assigned users workload distribution)
    const tasksPerUserMap = {};
    tasks.forEach(task => {
      if (task.assignedTo) {
        const userId = task.assignedTo._id.toString();
        const userName = task.assignedTo.name;
        if (!tasksPerUserMap[userId]) {
          tasksPerUserMap[userId] = { name: userName, count: 0 };
        }
        tasksPerUserMap[userId].count++;
      } else {
        if (!tasksPerUserMap['unassigned']) {
          tasksPerUserMap['unassigned'] = { name: 'Unassigned', count: 0 };
        }
        tasksPerUserMap['unassigned'].count++;
      }
    });
    const tasksPerUser = Object.values(tasksPerUserMap);

    // 6. Recent tasks logs (top 6 items)
    const recentTasks = tasks.slice(0, 6);

    // 7. Project summary cards (completion progress percentages per project)
    const projectSummaries = projects.map(proj => {
      const projTasks = tasks.filter(t => t.projectId._id.toString() === proj._id.toString());
      const completed = projTasks.filter(t => t.status === 'Completed').length;
      const total = projTasks.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        id: proj._id,
        name: proj.name,
        description: proj.description,
        creator: proj.createdBy?.name || 'Admin',
        memberCount: proj.members.length,
        taskCount: total,
        completedCount: completed,
        progress,
        deadline: proj.deadline,
        status: proj.status
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        tasksByStatus: {
          pending: stats.pending,
          inProgress: stats.inProgress,
          completed: stats.completed
        },
        overdueCount: overdueTasks.length,
        overdueTasks: overdueTasks.slice(0, 5), // return up to 5 overdue tasks details
        tasksPerUser,
        recentTasks,
        projectSummaries
      }
    });
  } catch (error) {
    next(error);
  }
};
