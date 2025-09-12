const express = require("express");
const router = express.Router();
const {
  register,
  login,
  stats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  deleteMultipleUsers,
} = require("../Controller/authController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/stats", authMiddleware, stats);
router.get("/users", authMiddleware, getAllUsers);
router.get("/users/:id", authMiddleware, getUserById);
router.put("/users/:id", authMiddleware, updateUser); 
router.delete("/users/:id", authMiddleware, deleteUser);
router.post("/users/deleteMultiple", authMiddleware, deleteMultipleUsers);

module.exports = router;
