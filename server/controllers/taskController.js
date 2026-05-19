const { db, admin } = require("../config/firebase");

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      assignedToName,
      createdBy,
      priority,
      dueDate,
    } = req.body;

    if (!title || !assignedTo || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "Title, assigned employee, and creator are required",
      });
    }

    const employeeSnap = await db
      .collection("users")
      .where("uid", "==", assignedTo)
      .limit(1)
      .get();

    if (employeeSnap.empty) {
      return res.status(404).json({
        success: false,
        message: "Assigned employee not found",
      });
    }

    const taskRef = await db.collection("tasks").add({
      title,
      description: description || "",
      assignedTo,
      assignedToName: assignedToName || "",
      createdBy,
      status: "pending",
      priority: priority || "medium",
      dueDate: dueDate || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      success: true,
      message: "Task created",
      taskId: taskRef.id,
    });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const snap = await db.collection("tasks").orderBy("createdAt", "desc").get();

    const tasks = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ success: true, tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    return res.status(500).json({ success: false, message: "Failed to get tasks" });
  }
};

const getEmployeeTasks = async (req, res) => {
  try {
    const { uid } = req.params;

    const snap = await db
      .collection("tasks")
      .where("assignedTo", "==", uid)
      .get();

    const tasks = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ success: true, tasks });
  } catch (error) {
    console.error("Get employee tasks error:", error);
    return res.status(500).json({ success: false, message: "Failed to get employee tasks" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("tasks").doc(id).update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({ success: true, message: "Task updated" });
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({ success: false, message: "Failed to update task" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("tasks").doc(id).delete();

    return res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete task" });
  }
};

module.exports = {
  createTask,
  getTasks,
  getEmployeeTasks,
  updateTask,
  deleteTask,
};