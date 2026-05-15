import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "./api/tasks";
import Dashboard from "./components/Dashboard";
import TaskForm from "./components/TaskForm";
import TaskCard from "./components/TaskCard";
import SearchFilter from "./components/SearchFilter";

// ── Toast ──────────────────────────────────────────────────────────────────────
let _toastId = 0;

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal confirm-dialog">
        <div className="modal-header">
          <h3 className="modal-title">Confirm Delete</h3>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>✕</button>
        </div>
        <div className="confirm-body">{message}</div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [tasks, setTasks]       = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError]       = useState("");
  const [filters, setFilters]   = useState({ search: "", status: "", priority: "", sort: "-createdAt" });

  const [showForm, setShowForm]         = useState(false);
  const [editingTask, setEditingTask]   = useState(null);
  const [confirmTask, setConfirmTask]   = useState(null);

  const [toasts, setToasts] = useState([]);
  const toastTimer = useRef({});

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const toast = useCallback((message, type = "info") => {
    const id = ++_toastId;
    setToasts((t) => [...t, { id, message, type }]);
    toastTimer.current[id] = setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
      delete toastTimer.current[id];
    }, 3000);
  }, []);

  // ── Data fetching ─────────────────────────────────────────────────────────────
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getTasks(filters);
      setTasks(res.data);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.getStats();
      setStats(res.data);
    } catch {
      /* non-critical */
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);
  useEffect(() => { loadStats(); }, [loadStats]);

  // ── CRUD handlers ─────────────────────────────────────────────────────────────
  const handleSave = async (formData) => {
    if (editingTask) {
      await api.updateTask(editingTask._id, formData);
      toast("Task updated successfully", "success");
    } else {
      await api.createTask(formData);
      toast("Task created!", "success");
    }
    setShowForm(false);
    setEditingTask(null);
    await loadTasks();
    await loadStats();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteConfirm = (task) => setConfirmTask(task);

  const handleDeleteExecute = async () => {
    try {
      await api.deleteTask(confirmTask._id);
      toast("Task deleted", "info");
      setConfirmTask(null);
      await loadTasks();
      await loadStats();
    } catch {
      toast("Failed to delete task", "error");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.updateStatus(id, status);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
      await loadStats();
      toast(`Status → ${status}`, "info");
    } catch {
      toast("Failed to update status", "error");
    }
  };

  const closeForm = () => { setShowForm(false); setEditingTask(null); };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-mark">✓</div>
            TaskFlow
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setEditingTask(null); setShowForm(true); }}
          >
            + New Task
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        {/* Stats Dashboard */}
        <Dashboard stats={stats} loading={statsLoading} />

        {/* Search & Filter Controls */}
        <SearchFilter filters={filters} onChange={setFilters} />

        {/* Task List */}
        <section>
          <div className="tasks-header" style={{ marginBottom: "1rem" }}>
            <h2 className="tasks-title">Tasks</h2>
            {!loading && (
              <span className="task-count-badge">{tasks.length} shown</span>
            )}
          </div>

          {error && (
            <div className="error-banner" style={{ marginBottom: "1rem" }}>
              ⚠ {error}
              <button
                className="btn btn-ghost btn-sm"
                onClick={loadTasks}
                style={{ marginLeft: "auto" }}
              >
                Retry
              </button>
            </div>
          )}

          <div className="tasks-grid">
            {loading ? (
              <div className="loading-wrap">
                <div className="spinner" />
                Loading tasks…
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3 className="empty-title">
                  {filters.search || filters.status || filters.priority
                    ? "No tasks match your filters"
                    : "No tasks yet"}
                </h3>
                <p className="empty-desc">
                  {filters.search || filters.status || filters.priority
                    ? "Try adjusting your search or filters"
                    : "Hit \"+ New Task\" to get started"}
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDeleteConfirm}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        </section>
      </main>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm task={editingTask} onSave={handleSave} onClose={closeForm} />
      )}

      {/* Delete Confirm */}
      {confirmTask && (
        <ConfirmDialog
          message={`Delete "${confirmTask.title}"? This cannot be undone.`}
          onConfirm={handleDeleteExecute}
          onCancel={() => setConfirmTask(null)}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
