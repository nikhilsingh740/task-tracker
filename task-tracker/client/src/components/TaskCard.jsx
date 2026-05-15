function formatDate(isoStr) {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_LABELS = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
};

const PRIORITY_LABELS = { low: "Low", medium: "Med", high: "High" };

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const overdue = task.isOverdue;
  const statusClass = task.status === "in-progress" ? "progress" : task.status;

  const handleStatusChange = (e) => onStatusChange(task._id, e.target.value);

  return (
    <div className={`task-card ${overdue ? "overdue" : ""} ${task.status === "completed" ? "completed" : ""}`}>
      <div className="card-top">
        <div className="card-badges">
          {overdue ? (
            <span className="badge badge-overdue">Overdue</span>
          ) : (
            <span className={`badge badge-${statusClass}`}>{STATUS_LABELS[task.status]}</span>
          )}
          <span className={`badge badge-${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
        </div>

        <div className="card-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(task)}
            title="Edit task"
            style={{ fontSize: "0.85rem" }}
          >
            ✎
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onDelete(task)}
            title="Delete task"
            style={{ fontSize: "0.85rem", color: "var(--status-overdue)" }}
          >
            ✕
          </button>
        </div>
      </div>

      <h3 className="card-title">{task.title}</h3>
      <p className="card-desc">{task.description}</p>

      {task.tags?.length > 0 && (
        <div className="card-tags">
          {task.tags.map((t) => (
            <span key={t} className="tag">#{t}</span>
          ))}
        </div>
      )}

      <div className="card-meta">
        <span className={`card-date ${overdue ? "overdue" : ""}`}>
          📅 {formatDate(task.dueDate)}
          {overdue && " — overdue"}
        </span>

        <select
          className="status-select-mini"
          value={task.status}
          onChange={handleStatusChange}
          title="Change status"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
}
