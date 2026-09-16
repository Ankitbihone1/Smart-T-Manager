const { tasks, users, createTaskId } = require("../data/store");
const {
  isTaskBlocked,
  getBlockedReason,
  canCompleteTask,
} = require("../services/taskService");

function validateTaskInput(body) {
  const { title, description, priority, status, assignedUserId } = body;

  if (!title || !description || !priority || !status || !assignedUserId) {
    return "Title, description, priority, status and assigned user are required.";
  }

  if (!["Low", "Medium", "High"].includes(priority)) {
    return "Priority must be Low, Medium or High.";
  }

  if (!["To Do", "In Progress", "Done"].includes(status)) {
    return "Status must be To Do, In Progress or Done.";
  }

  if (!users.has(String(assignedUserId))) {
    return "Assigned user does not exist.";
  }

  return null;
}

function normalizeDependencies(dependencyIds = [], currentTaskId = null) {
  return [...new Set(dependencyIds.map(String))].filter(
    (id) => id !== String(currentTaskId)
  );
}

function taskResponse(task) {
  const assignedUser = users.get(String(task.assignedUserId));
  const blocked = isTaskBlocked(task);

  return {
    ...task,
    blocked,
    blockedReason: getBlockedReason(task),
    assignedUser: assignedUser
      ? { id: assignedUser.id, name: assignedUser.name, email: assignedUser.email }
      : null,
  };
}

function getTasks(req, res) {
  let result = [...tasks.values()].map(taskResponse);

  if (req.query.userId) {
    result = result.filter(
      (task) => task.assignedUserId === String(req.query.userId)
    );
  }

  if (req.query.priority && req.query.priority !== "All") {
    result = result.filter((task) => task.priority === req.query.priority);
  }

  if (req.query.status && req.query.status !== "All") {
    result = result.filter((task) => task.status === req.query.status);
  }

  return res.json(result);
}

function getTask(req, res) {
  const task = tasks.get(String(req.params.id));

  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  return res.json(taskResponse(task));
}

function createTask(req, res) {
  const validationError = validateTaskInput(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const dependencyIds = normalizeDependencies(req.body.dependencyIds || []);

  for (const dependencyId of dependencyIds) {
    if (!tasks.has(dependencyId)) {
      return res.status(400).json({
        message: `Dependency task ${dependencyId} does not exist.`,
      });
    }
  }

  const task = {
    id: createTaskId(),
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    priority: req.body.priority,
    status: req.body.status,
    assignedUserId: String(req.body.assignedUserId),
    dependencyIds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // "Done" is not allowed during creation if dependencies are incomplete.
  if (task.status === "Done" && isTaskBlocked(task)) {
    return res.status(400).json({
      message: "Task cannot be created as Done because a dependency is incomplete.",
    });
  }

  tasks.set(task.id, task);

  return res.status(201).json({
    message: "Task created successfully.",
    task: taskResponse(task),
  });
}

function updateTask(req, res) {
  const task = tasks.get(String(req.params.id));

  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  const merged = {
    ...task,
    ...req.body,
  };

  const validationError = validateTaskInput(merged);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const dependencyIds = normalizeDependencies(
    merged.dependencyIds || [],
    task.id
  );

  for (const dependencyId of dependencyIds) {
    if (!tasks.has(dependencyId)) {
      return res.status(400).json({
        message: `Dependency task ${dependencyId} does not exist.`,
      });
    }
  }

  merged.dependencyIds = dependencyIds;
  merged.assignedUserId = String(merged.assignedUserId);
  merged.updatedAt = new Date().toISOString();

  if (merged.status === "Done" && isTaskBlocked(merged)) {
    return res.status(400).json({
      message: "Task cannot be marked Done because a dependency is incomplete.",
    });
  }

  tasks.set(task.id, merged);

  return res.json({
    message: "Task updated successfully.",
    task: taskResponse(merged),
  });
}

function deleteTask(req, res) {
  const taskId = String(req.params.id);

  if (!tasks.has(taskId)) {
    return res.status(404).json({ message: "Task not found." });
  }

  // Do not allow deleting a task that another task depends on.
  const dependentTask = [...tasks.values()].find((task) =>
    (task.dependencyIds || []).includes(taskId)
  );

  if (dependentTask) {
    return res.status(409).json({
      message: `Cannot delete this task because "${dependentTask.title}" depends on it.`,
    });
  }

  tasks.delete(taskId);

  return res.json({ message: "Task deleted successfully." });
}

function completeTask(req, res) {
  const task = tasks.get(String(req.params.id));

  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  if (!canCompleteTask(task)) {
    return res.status(409).json({
      message: "Task is blocked. Complete all dependencies first.",
      blockedReason: getBlockedReason(task),
    });
  }

  task.status = "Done";
  task.updatedAt = new Date().toISOString();
  tasks.set(task.id, task);

  return res.json({
    message: "Task marked as Done.",
    task: taskResponse(task),
  });
}

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
};
