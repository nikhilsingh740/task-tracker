const { body, validationResult } = require("express-validator");

// Rules applied on create and update
const taskValidationRules = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 3, max: 100 }).withMessage("Title must be 3–100 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 5, max: 500 }).withMessage("Description must be 5–500 characters"),

  body("dueDate")
    .notEmpty().withMessage("Due date is required")
    .isISO8601().withMessage("Due date must be a valid date"),

  body("status")
    .optional()
    .isIn(["pending", "in-progress", "completed"])
    .withMessage("Status must be pending, in-progress, or completed"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),

  body("tags")
    .optional()
    .isArray().withMessage("Tags must be an array"),
];

// Express middleware that checks results and returns 400 on errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { taskValidationRules, validate };
