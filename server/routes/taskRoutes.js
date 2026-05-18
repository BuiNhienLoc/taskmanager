const express = require("express");
const router = express.Router();
 
const {
  createTask,
  getTasks,
  getEmployeeTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
 
const { verifyToken, requireOwner } = require("../middleware/authMiddleware");
 
router.get("/employee/:uid", verifyToken, getEmployeeTasks);
router.put("/:id", verifyToken, updateTask);
 
router.post("/", verifyToken, requireOwner, createTask);
router.get("/", verifyToken, requireOwner, getTasks);
router.delete("/:id", verifyToken, requireOwner, deleteTask);
 
module.exports = router;