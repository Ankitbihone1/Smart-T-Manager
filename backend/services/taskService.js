const { tasks } = require("../data/store");

function getDependencyTasks(task) {
  return (task.dependencyIds || [])
    .map((id) => tasks.get(String(id)))
    .filter(Boolean);
}

function isTaskBlocked(task) {
  const dependencies = getDependencyTasks(task);

  // A task is blocked when at least one dependency exists and is not Done.
  return dependencies.some((dependency) => dependency.status !== "Done");
}

function getBlockedReason(task) {
  const incomplete = getDependencyTasks(task).filter(
    (dependency) => dependency.status !== "Done"
  );

  if (!incomplete.length) return null;

  return `Waiting for: ${incomplete.map((item) => item.title).join(", ")}`;
}

function canCompleteTask(task) {
  return !isTaskBlocked(task);
}

module.exports = {
  getDependencyTasks,
  isTaskBlocked,
  getBlockedReason,
  canCompleteTask,
};
