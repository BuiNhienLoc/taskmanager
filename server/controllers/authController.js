const { db } = require("../config/firebase");

const normalizePhoneNumber = (phoneNumber) => {
  return phoneNumber.replace(/[^\d+]/g, "");
};

const checkOwnerPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

    console.log("Checking owner phone:", normalizedPhoneNumber);

    const ownerSnap = await db
      .collection("users")
      .where("phoneNumber", "==", normalizedPhoneNumber)
      .where("role", "==", "owner")
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (ownerSnap.empty) {
      return res.status(403).json({
        success: false,
        message: "Phone number is not registered as an active owner",
      });
    }

    return res.json({
      success: true,
      message: "Owner phone verified",
    });
  } catch (error) {
    console.error("Check owner phone error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check owner phone",
    });
  }
};

module.exports = {
  checkOwnerPhone,
};