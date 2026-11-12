import React, { useState, useEffect } from "react";
import { req } from "../common/api.js";

export function AdminMaker({ notify, setError }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    req("/admin-change-candidates")
      .then((list) => {
        setUsers(list);
        setSelected(String(list[0]?.id || ""));
      })
      .catch((e) => setError(e.message));
  }, []);
  async function submit() {
    const user = users.find((u) => String(u.id) === selected);
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      await req(`/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...user,
          displayName: user.displayName,
          userIdentifier: user.userIdentifier,
          solId: user.solId,
          userType: "OPERATIONS_USER",
          role: "ADMIN",
          designation: user.designation,
        }),
      });
      notify(
        "Admin promotion request submitted. A DGM or above must approve it.",
      );
      setUsers(users.filter((u) => String(u.id) !== selected));
      setSelected("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">MAKER CHECKER</div>
          <h1>Admin maker</h1>
          <p>
            Operations Users of any designation can request an Operations User
            be promoted to Administrator. A different DGM or above must approve.
          </p>
        </div>
      </div>
      <div className="panel list-panel user-edit-panel">
        <div className="user-edit-form">
          <div className="field full-field">
            <label>Operations User</label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Select a user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} · {u.displayName} · {u.designation}
                </option>
              ))}
            </select>
          </div>
          <button
            className="primary"
            disabled={busy || !selected}
            onClick={submit}
          >
            {busy ? "Submitting…" : "Request Admin promotion"}
          </button>
          {!users.length && (
            <p className="empty-state">
              No Operations Users are available for promotion.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
