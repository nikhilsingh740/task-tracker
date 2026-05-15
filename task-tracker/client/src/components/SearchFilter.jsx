export default function SearchFilter({ filters, onChange }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="controls">
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="input"
          placeholder="Search tasks…"
          value={filters.search}
          onChange={set("search")}
        />
      </div>

      <div className="select-wrap">
        <select className="input select" value={filters.status} onChange={set("status")}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="select-wrap">
        <select className="input select" value={filters.priority} onChange={set("priority")}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="select-wrap">
        <select className="input select" value={filters.sort} onChange={set("sort")}>
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="dueDate">Due Date ↑</option>
          <option value="-dueDate">Due Date ↓</option>
          <option value="-priority">Priority ↑</option>
        </select>
      </div>
    </div>
  );
}
