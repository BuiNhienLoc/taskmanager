const express = require("express");
const router = express.Router();

const {
  createEmployee,
  setupEmployeeAccount,
  deleteEmployee,
  updateEmployee
} = require("../controllers/employeeController");

router.post("/", createEmployee);
router.post("/setup-account", setupEmployeeAccount);

router.delete("/:id", deleteEmployee);

router.put("/:id", updateEmployee);

module.exports = router;