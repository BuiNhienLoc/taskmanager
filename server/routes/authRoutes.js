const express = require("express");
const router = express.Router();

const { checkOwnerPhone } = require("../controllers/authController");

router.post("/check-owner-phone", checkOwnerPhone);

module.exports = router;