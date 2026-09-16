const express = require("express");
const {
  createUser,
  login,
  getUsers,
} = require("../controllers/userController");

const router = express.Router();

router.post("/", createUser);
router.post("/login", login);
router.get("/", getUsers);

module.exports = router;
