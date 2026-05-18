const { admin } = require("../config/firebase");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: missing or malformed token",
    });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // uid, email, etc. now available downstream
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: invalid or expired token",
    });
  }
};


const { db } = require("../config/firebase");

const requireOwner = async (req, res, next) => {
  try {
    const snap = await db
      .collection("users")
      .where("uid", "==", req.user.uid)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const role = snap.docs[0].data().role;

    if (role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: owner access required",
      });
    }

    next();
  } catch (error) {
    console.error("requireOwner error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { verifyToken, requireOwner };