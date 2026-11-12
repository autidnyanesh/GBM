import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { roleName } from "../common/format.js";
import { req } from "../common/api.js";

export function UserManagement({ session, notify, setError }) {
  const [data, setData] = useState({
    users: [],
    canManage: false,
    currentUserId: null,
  });
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [sols, setSols] = useState([]);
  const [busy, setBusy] = useState(false);
  const [editingType, setEditingType] = useState("BRANCH_USER");
  const [editingRole, setEditingRole] = useState("MAKER");
  const [editingDesignation, setEditingDesignation] = useState("MANAGER");
  const refresh = () =>
    req("/users")
      .then((d) => {
        setData(d);
        setSelected((prev) => prev || String(d.users[0]?.id || ""));
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    refresh();
    req("/sols")
      .then(setSols)
      .catch(() => {});
  }, []);
  const visible = data.users.filter((u) =>
    `${u.username} ${u.displayName} ${u.userIdentifier} ${u.solId} ${u.role} ${u.userType}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const chosen = data.users.find((u) => String(u.id) === selected);
  useEffect(() => {
    if (chosen) {
      setEditingType(chosen.userType || "BRANCH_USER");
      setEditingRole(chosen.role);
      setEditingDesignation(chosen.designation || "MANAGER");
    }
  }, [chosen?.id, chosen?.userType, chosen?.role]);
  const canPromote =
    chosen?.userType === "OPERATIONS_USER" &&
    (Number(chosen?.id) !== Number(data.currentUserId) ||
      chosen?.role === "ADMIN");
  const roles =
    editingType === "BRANCH_USER"
      ? [
          ["MAKER", "Maker"],
          ["CHECKER", "Checker"],
        ]
      : editingType === "OPERATIONS_USER"
        ? [
            ["OPERATIONS_USER", "Operations User"],
            ...(canPromote ? [["ADMIN", "Administrator"]] : []),
          ]
        : [["AUDIT_USER", "Audit User"]];
  async function save(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      body = {
        ...Object.fromEntries(f.entries()),
        userType: editingType,
        role: editingRole,
        designation: editingDesignation,
      };
    setBusy(true);
    setError("");
    try {
      await req(`/users/${selected}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      notify("User change submitted for maker-checker approval.");
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const typeName = (t) =>
    ({
      BRANCH_USER: "Branch User",
      OPERATIONS_USER: "Operations User",
      AUDIT_USER: "Audit User",
    })[t] || t;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">SOL ACCESS</div>
          <h1>User management</h1>
          <p>
            Find staff users and manage their access type, SOL ID, and
            permissions.
          </p>
        </div>
      </div>
      <div className="panel list-panel">
        <div className="list-toolbar">
          <div className="searchbox">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search username, user ID, SOL ID or role"
            />
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>USERNAME</th>
                <th>NAME</th>
                <th>USER ID</th>
                <th>SOL ID</th>
                <th>ACCESS TYPE</th>
                <th>DESIGNATION</th>
                <th>ROLE</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.displayName}</td>
                  <td>{u.userIdentifier}</td>
                  <td>{u.solId}</td>
                  <td>{typeName(u.userType)}</td>
                  <td>{u.designation || "—"}</td>
                  <td>{roleName(u.role)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && (
            <div className="empty-state">No users match your search.</div>
          )}
        </div>
      </div>
      {data.canManage && (
        <div className="panel list-panel user-edit-panel">
          <div className="panel-head">
            <div>
              <h3>Edit user access</h3>
              <p>
                Changes are staged for approval by an Operations User designated
                DGM or above. Only Operations Users may become Administrators.
              </p>
            </div>
          </div>
          <form className="user-edit-form" onSubmit={save}>
            <div className="field full-field">
              <label>Select user</label>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                {data.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} · {u.displayName}
                  </option>
                ))}
              </select>
            </div>
            {chosen && (
              <>
                <div className="field">
                  <label>Full name</label>
                  <input
                    name="displayName"
                    defaultValue={chosen.displayName}
                    key={`name-${chosen.id}-${chosen.displayName}`}
                    required
                  />
                </div>
                <div className="field">
                  <label>Username</label>
                  <input
                    name="username"
                    defaultValue={chosen.username}
                    key={`user-${chosen.id}-${chosen.username}`}
                    required
                  />
                </div>
                <div className="field">
                  <label>User identification number</label>
                  <input
                    name="userIdentifier"
                    defaultValue={chosen.userIdentifier}
                    key={`id-${chosen.id}-${chosen.userIdentifier}`}
                    required
                    maxLength="255"
                  />
                </div>
                <div className="field">
                  <label>SOL ID</label>
                  <select
                    name="solId"
                    defaultValue={chosen.solId}
                    key={`sol-${chosen.id}-${chosen.solId}`}
                  >
                    {sols.map((sol) => (
                      <option key={sol.solId} value={sol.solId}>
                        {sol.solId} · {sol.solName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Access type</label>
                  <select
                    value={editingType}
                    onChange={(e) => {
                      const type = e.target.value;
                      setEditingType(type);
                      setEditingRole(
                        type === "BRANCH_USER"
                          ? "MAKER"
                          : type === "OPERATIONS_USER"
                            ? "OPERATIONS_USER"
                            : "AUDIT_USER",
                      );
                    }}
                  >
                    <option value="BRANCH_USER">Branch User</option>
                    <option value="OPERATIONS_USER">Operations User</option>
                    <option value="AUDIT_USER">Audit User</option>
                  </select>
                </div>
                {editingType === "OPERATIONS_USER" && (
                  <div className="field">
                    <label>Designation</label>
                    <select
                      value={editingDesignation}
                      onChange={(e) => setEditingDesignation(e.target.value)}
                    >
                      {[
                        ["AM", "AM - Assistant Manager"],
                        ["M", "M - Manager"],
                        ["AGM", "AGM - Assistant General Manager"],
                        ["DGM", "DGM - Deputy General Manager"],
                        ["GM", "GM - General Manager"],
                        ["CGM", "CGM - Chief General Manager"],
                      ].map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="field">
                  <label>Role</label>
                  <select
                    value={editingRole}
                    onChange={(e) => setEditingRole(e.target.value)}
                  >
                    {roles.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="primary" disabled={busy}>
                  {busy ? "Saving…" : "Save changes"}
                </button>
              </>
            )}
          </form>
        </div>
      )}
      {!data.canManage && (
        <p className="login-account-note">
          Only administrators can edit user access.
        </p>
      )}
    </>
  );
}
