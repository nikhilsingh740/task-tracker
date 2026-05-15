import { useState, useEffect } from "react";

const EMPTY = {
  title: "",
  description: "",
  dueDate: "",
  status: "pending",
  priority: "medium",
  tags: [],
};

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function toInputDate(isoStr) {
  if (!isoStr) return "";
  return isoStr.split("T")[0];
}

export default function TaskForm({ task, onSave, onClose }) {
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title || "",
        description: task.description || "",
        dueDate:     toInputDate(task.dueDate),
        status:      task.status || "pending",
        priority:    task.priority || "medium",
        tags:        task.tags || [],
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [task]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.trim().length < 3)
      e.title = "Title must be at least 3 characters";
    if (!form.description.trim() || form.description.trim().length < 5)
      e.description = "Description must be at least 5 characters";
    if (!form.dueDate)
      e.dueDate = "Due date is required";
    return e;
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t) && form.tags.length < 6) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  };

  const removeTag = (tag) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    try {
      await onSave({
        ...form,
        dueDate: new Date(form.dueDate).toISOString(),
      });
    } catch (err) {
      // surface server-side validation errors
      if (err.errors) {
        const mapped = {};
        err.errors.forEach(({ field, message }) => (mapped[field] = message));
        setErrors(mapped);
      } else {
        setErrors({ _global: err.message || "Failed to save task" });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3 className="modal-title">{task ? "Edit Task" : "New Task"}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          {errors._global && (
            <div className="error-banner">⚠ {errors._global}</div>
          )}

          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              className={`input ${errors.title ? "error" : ""}`}
              placeholder="e.g. Complete React assignment"
              value={form.title}
              onChange={set("title")}
              maxLength={100}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="desc">Description</label>
            <textarea
              id="desc"
              className={`input ${errors.description ? "error" : ""}`}
              placeholder="Describe what needs to be done…"
              value={form.description}
              onChange={set("description")}
              maxLength={500}
              rows={3}
            />
            {errors.description && (
              <span className="field-error">{errors.description}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                type="date"
                className={`input ${errors.dueDate ? "error" : ""}`}
                value={form.dueDate}
                onChange={set("dueDate")}
                min={task ? undefined : todayISO()}
              />
              {errors.dueDate && (
                <span className="field-error">{errors.dueDate}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <div className="select-wrap">
                <select
                  id="priority"
                  className="input select"
                  value={form.priority}
                  onChange={set("priority")}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {task && (
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <div className="select-wrap">
                <select
                  id="status"
                  className="input select"
                  value={form.status}
                  onChange={set("status")}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Tags (optional)</label>
            <div className="tags-input-row">
              <input
                className="input"
                placeholder="e.g. react"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                maxLength={20}
              />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={addTag}
                style={{ whiteSpace: "nowrap" }}
              >
                + Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="tags-list">
                {form.tags.map((t) => (
                  <button
                    key={t}
                    className="tag-remove"
                    onClick={() => removeTag(t)}
                    title="Remove tag"
                  >
                    {t} ✕
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
