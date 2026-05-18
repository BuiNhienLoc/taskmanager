const crypto = require("crypto");
const { db, admin } = require("../config/firebase");
const { sendEmployeeSetupEmail } = require("../services/emailService");


const createEmployee = async (req, res) => {
  try {
    const { name, email, phoneNumber, role } = req.body;

    if (!name || !email || !phoneNumber || !role) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const employeeRef = db.collection("users").doc();

    await employeeRef.set({
      uid: null,
      pendingUserId: employeeRef.id,
      name,
      username: null,
      email,
      phoneNumber,
      role,
      avatar: null,
      avatarPath: null,
      isOnline: false,
      isActive: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await db.collection("employeeInvites").add({
      employeeId: employeeRef.id,
      email,
      tokenHash,
      used: false,
      expiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      ),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const setupLink = `${process.env.CLIENT_URL}/setup-account?token=${encodeURIComponent(rawToken)}`;

    await sendEmployeeSetupEmail(email, name, setupLink);

    return res.status(201).json({
      success: true,
      message: "Employee created and setup email sent",
      employeeId: employeeRef.id,
    });
  } catch (error) {
    console.error("Create employee error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create employee",
    });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employeeRef = db.collection("users").doc(id);
    const employeeDoc = await employeeRef.get();

    if (!employeeDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const employee = employeeDoc.data();

    if (employee.uid) {
      await admin.auth().deleteUser(employee.uid);
    }

    await employeeRef.delete();

    return res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete employee error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete employee",
    });
  }
};

const setupEmployeeAccount = async (req, res) => {
  try {
    const { token, username, password } = req.body;

    if (!token || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Token, username, and password are required",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const inviteSnap = await db
      .collection("employeeInvites")
      .where("tokenHash", "==", tokenHash)
      .where("used", "==", false)
      .limit(1)
      .get();

    if (inviteSnap.empty) {
      return res.status(400).json({
        success: false,
        message: "Invalid or used setup link",
      });
    }

    const inviteDoc = inviteSnap.docs[0];
    const invite = inviteDoc.data();

    if (invite.expiresAt.toDate() < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Setup link expired",
      });
    }

    const employeeDoc = await db
      .collection("users")
      .doc(invite.employeeId)
      .get();

    if (!employeeDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const employee = employeeDoc.data();

    const userRecord = await admin.auth().createUser({
      email: employee.email,
      password,
      displayName: employee.name,
      phoneNumber: employee.phoneNumber,
    });

    await db.collection("users").doc(invite.employeeId).update({
      uid: userRecord.uid,
      username,
      isActive: true,
      accountSetupComplete: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection("employeeInvites").doc(inviteDoc.id).update({
      used: true,
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      success: true,
      message: "Employee account setup complete",
    });
  } catch (error) {
    console.error("Setup employee account error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set up employee account",
    });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber, role } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const employeeRef = db.collection("users").doc(id);
    const employeeDoc = await employeeRef.get();

    if (!employeeDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    await employeeRef.update({
      name,
      email,
      phoneNumber,
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (error) {
    console.error("Update employee error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update employee",
    });
  }
};

module.exports = {
  createEmployee,
  setupEmployeeAccount,
  deleteEmployee,
  updateEmployee,
};