const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const { taskValidationRules, validate } = require("../middleware/validation");

// ─── Helper ───────────────────────────────────────────────────────────────────

const buildFilter = (query) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }
  return filter;
};

// ─── GET /api/tasks ──────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const sort = req.query.sort || "-createdAt";

    const tasks = await Task.find(filter).sort(sort).lean({ virtuals: true });

    // Attach isOverdue manually (lean doesn't run virtuals without the option above)
    const now = new Date();
    const enriched = tasks.map((t) => ({
      ...t,
      isOverdue: t.status !== "completed" && new Date(t.dueDate) < now,
    }));

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ─── GET /api/tasks/stats ────────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const now = new Date();
    const [total, pending, inProgress, completed, overdue] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: "pending" }),
      Task.countDocuments({ status: "in-progress" }),
      Task.countDocuments({ status: "completed" }),
      Task.countDocuments({ status: { $ne: "completed" }, dueDate: { $lt: now } }),
    ]);

    res.json({
      success: true,
      data: { total, pending, inProgress, completed, overdue },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ─── GET /api/tasks/:id ──────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).lean({ virtuals: true });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const now = new Date();
    task.isOverdue = task.status !== "completed" && new Date(task.dueDate) < now;

    res.json({ success: true, data: task });
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid task ID" });
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ─── POST /api/tasks ─────────────────────────────────────────────────────────
router.post("/", taskValidationRules, validate, async (req, res) => {
  try {
    const { title, description, dueDate, status, priority, tags } = req.body;
    const task = await Task.create({ title, description, dueDate, status, priority, tags });

    const plain = task.toObject({ virtuals: true });
    const now = new Date();
    plain.isOverdue = plain.status !== "completed" && new Date(plain.dueDate) < now;

    res.status(201).json({ success: true, data: plain });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ─── PUT /api/tasks/:id ──────────────────────────────────────────────────────
router.put("/:id", taskValidationRules, validate, async (req, res) => {
  try {
    const { title, description, dueDate, status, priority, tags } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, dueDate, status, priority, tags },
      { new: true, runValidators: true }
    ).lean({ virtuals: true });

    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const now = new Date();
    task.isOverdue = task.status !== "completed" && new Date(task.dueDate) < now;

    res.json({ success: true, data: task });
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid task ID" });
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ─── PATCH /api/tasks/:id/status ────────────────────────────────────────────
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "in-progress", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).lean({ virtuals: true });

    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const now = new Date();
    task.isOverdue = task.status !== "completed" && new Date(task.dueDate) < now;

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ─── DELETE /api/tasks/:id ───────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid task ID" });
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;
