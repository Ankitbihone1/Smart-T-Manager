const { users, createUserId } = require("../data/store");

function createUser(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = [...users.values()].find(
    (user) => user.email === normalizedEmail
  );

  if (existing) {
    return res.status(409).json({ message: "Email already exists." });
  }

  const user = {
    id: createUserId(),
    name: name.trim(),
    email: normalizedEmail,
    password,
  };

  users.set(user.id, user);

  const { password: _, ...safeUser } = user;

  return res.status(201).json({
    message: "User created successfully.",
    user: safeUser,
  });
}

function login(req, res) {
  const { email, password } = req.body;

  const user = [...users.values()].find(
    (item) =>
      item.email === String(email || "").trim().toLowerCase() &&
      item.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password.",
    });
  }

  const { password: _, ...safeUser } = user;

  return res.json({
    message: "Login successful.",
    user: safeUser,
  });
}

function getUsers(req, res) {
  const result = [...users.values()].map(({ password, ...user }) => user);
  return res.json(result);
}

module.exports = {
  createUser,
  login,
  getUsers,
};
