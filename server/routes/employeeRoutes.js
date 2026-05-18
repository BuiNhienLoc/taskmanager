const express = require("express");
const router = express.Router();

const {
  createEmployee,
  setupEmployeeAccount,
  deleteEmployee,
  updateEmployee,
} = require("../controllers/employeeController");

const { verifyToken, requireOwner } = require("../middleware/authMiddleware");

router.post("/setup-account", setupEmployeeAccount);

router.post("/", verifyToken, requireOwner, createEmployee);
router.delete("/:id", verifyToken, requireOwner, deleteEmployee);
router.put("/:id", verifyToken, requireOwner, updateEmployee);

module.exports = router;