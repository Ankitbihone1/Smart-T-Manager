"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const emptyForm = {
  title: "",
  description: "",
  priority: "Medium",
  status: "To Do",
  assignedUserId: "",
  dependencyIds: [],
};

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children, type = "default" }) {
  const styles = {
    High: "bg-red-50 text-red-700",
    Medium: "bg-amber-50 text-amber-700",
    Low: "bg-emerald-50 text-emerald-700",
    "To Do": "bg-slate-100 text-slate-700",
    "In Progress": "bg-blue-50 text-blue-700",
    Done: "bg-emerald-50 text-emerald-700",
    blocked: "bg-red-50 text-red-700",
    default: "bg-slate-100 text-slate-700",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[type] || styles.default}`}>
      {children}
    </span>
  );
}

function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      const result = await api.login({ email, password });
      onLogin(result.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <p className="text-sm font-bold text-blue-600">SMART TASK MANAGER</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Login to manage your tasks.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
            Login
          </button>
        </form>

        <button
          onClick={onRegister}
          className="mt-5 w-full text-sm font-semibold text-blue-600 hover:underline"
        >
          Create a new user
        </button>
      </Card>
    </main>
  );
}

function Register({ onBack }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.createUser(form);
      setMessage("Account created. You can now login.");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md p-8">
        <p className="text-sm font-bold text-blue-600">SMART TASK MANAGER</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Create account</h1>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {message && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
            Create Account
          </button>
        </form>

        <button onClick={onBack} className="mt-5 w-full text-sm font-semibold text-slate-600 hover:underline">
          Back to Login
        </button>
      </Card>
    </main>
  );
}

function TaskForm({ users, tasks, initialTask, onSaved, onCancel }) {
  const [form, setForm] = useState(initialTask || emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initialTask || { ...emptyForm, assignedUserId: users[0]?.id || "" });
  }, [initialTask, users]);

  function toggleDependency(id) {
    setForm((current) => ({
      ...current,
      dependencyIds: current.dependencyIds.includes(id)
        ? current.dependencyIds.filter((item) => item !== id)
        : [...current.dependencyIds, id],
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (initialTask) {
        await api.updateTask(initialTask.id, form);
      } else {
        await api.createTask(form);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">{initialTask ? "Edit Task" : "Create New Task"}</h2>
        <p className="mt-1 text-sm text-slate-500">Add task details and dependencies.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          placeholder="Task title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <textarea
          className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        <div className="grid gap-4 md:grid-cols-3">
          <select
            className="rounded-xl border border-slate-300 px-4 py-3"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <select
            className="rounded-xl border border-slate-300 px-4 py-3"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>

          <select
            className="rounded-xl border border-slate-300 px-4 py-3"
            value={form.assignedUserId}
            onChange={(e) => setForm({ ...form, assignedUserId: e.target.value })}
            required
          >
            <option value="">Assign user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">Dependencies</p>
          <div className="grid gap-2 md:grid-cols-2">
            {tasks
              .filter((task) => task.id !== initialTask?.id)
              .map((task) => (
                <label key={task.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.dependencyIds.includes(task.id)}
                    onChange={() => toggleDependency(task.id)}
                  />
                  <span>{task.title}</span>
                </label>
              ))}
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="flex gap-3">
          <button disabled={saving} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50">
            {saving ? "Saving..." : initialTask ? "Update Task" : "Create Task"}
          </button>
          <button type="button" onClick={onCancel} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}

function TaskCard({ task, onEdit, onDelete, onComplete }) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">{task.title}</h3>
            <Badge type={task.priority}>{task.priority}</Badge>
            <Badge type={task.status}>{task.status}</Badge>
            {task.blocked && <Badge type="blocked">Blocked</Badge>}
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
            <span>Assigned to: <strong>{task.assignedUser?.name || "Unknown"}</strong></span>
            {task.dependencyIds?.length > 0 && (
              <span>Dependencies: {task.dependencyIds.length}</span>
            )}
          </div>

          {task.blocked && (
            <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              <strong>Blocked:</strong> {task.blockedReason}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button onClick={() => onEdit(task)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">
            Edit
          </button>
          <button onClick={() => onDelete(task)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">
            Delete
          </button>
          {task.status !== "Done" && (
            <button
              onClick={() => onComplete(task)}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Mark Done
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

function Dashboard({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState("my");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [priority, setPriority] = useState("All");
  const [status, setStatus] = useState("All");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [usersResult, tasksResult] = await Promise.all([
        api.getUsers(),
        api.getTasks(),
      ]);
      setUsers(usersResult);
      setTasks(tasksResult);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesView = view === "my" ? task.assignedUserId === user.id : true;
      const matchesPriority = priority === "All" || task.priority === priority;
      const matchesStatus = status === "All" || task.status === status;
      return matchesView && matchesPriority && matchesStatus;
    });
  }, [tasks, view, user.id, priority, status]);

  const blockedCount = tasks.filter((task) => task.blocked).length;
  const doneCount = tasks.filter((task) => task.status === "Done").length;

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    try {
      await api.deleteTask(task.id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function completeTask(task) {
    try {
      await api.completeTask(task.id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    localStorage.removeItem("smart-task-user");
    onLogout();
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs font-bold tracking-wider text-blue-600">SMART TASK MANAGER</p>
            <h1 className="text-xl font-bold text-slate-900">Task Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <button onClick={logout} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-7">
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-5">
            <p className="text-sm text-slate-500">Total Tasks</p>
            <p className="mt-2 text-3xl font-bold">{tasks.length}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-slate-500">Completed</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{doneCount}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-slate-500">Blocked</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{blockedCount}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-slate-500">Users</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{users.length}</p>
          </Card>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[230px_1fr]">
          <Card className="h-fit p-3">
            {[
              ["my", "My Tasks"],
              ["all", "All Tasks"],
              ["blocked", "Blocked Tasks"],
              ["users", "Users"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`mb-1 w-full rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                  view === key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </Card>

          <section>
            {view !== "users" && (
              <>
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {view === "my" ? "My Tasks" : view === "blocked" ? "Blocked Tasks" : "All Tasks"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {view === "blocked" ? "Tasks waiting for dependencies to complete." : "Manage and track your work."}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setShowForm(true);
                    }}
                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    + New Task
                  </button>
                </div>

                {showForm && (
                  <div className="mb-6">
                    <TaskForm
                      users={users}
                      tasks={tasks}
                      initialTask={editingTask}
                      onSaved={async () => {
                        setShowForm(false);
                        setEditingTask(null);
                        await loadData();
                      }}
                      onCancel={() => {
                        setShowForm(false);
                        setEditingTask(null);
                      }}
                    />
                  </div>
                )}

                <div className="mb-5 flex flex-wrap gap-3">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm"
                  >
                    <option>All</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm"
                  >
                    <option>All</option>
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                </div>

                {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

                <div className="space-y-4">
                  {(view === "blocked" ? filteredTasks.filter((task) => task.blocked) : filteredTasks).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={(selected) => {
                        setEditingTask({
                          ...selected,
                          dependencyIds: selected.dependencyIds || [],
                        });
                        setShowForm(true);
                      }}
                      onDelete={deleteTask}
                      onComplete={completeTask}
                    />
                  ))}

                  {((view === "blocked" ? filteredTasks.filter((task) => task.blocked) : filteredTasks).length === 0) && (
                    <Card className="p-10 text-center">
                      <p className="font-semibold text-slate-700">No tasks found</p>
                      <p className="mt-1 text-sm text-slate-500">Create a task or change the filters.</p>
                    </Card>
                  )}
                </div>
              </>
            )}

            {view === "users" && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900">All Users</h2>
                <p className="mt-1 text-sm text-slate-500">Users available for task assignment.</p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {users.map((item) => (
                    <Card key={item.id} className="p-5">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.email}</p>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("smart-task-user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
        setScreen("dashboard");
      } catch {
        localStorage.removeItem("smart-task-user");
      }
    }
  }, []);

  function login(nextUser) {
    localStorage.setItem("smart-task-user", JSON.stringify(nextUser));
    setUser(nextUser);
    setScreen("dashboard");
  }

  if (screen === "register") {
    return <Register onBack={() => setScreen("login")} />;
  }

  if (!user) {
    return <Login onLogin={login} onRegister={() => setScreen("register")} />;
  }

  return <Dashboard user={user} onLogout={() => { setUser(null); setScreen("login"); }} />;
}
