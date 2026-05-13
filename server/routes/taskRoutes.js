const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  getEmployeeTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

router.post("/", createTask);
router.get("/", getTasks);
router.get("/employee/:uid", getEmployeeTasks);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;